import { randomUUID } from 'node:crypto'
import { buildMessage, smtpSend } from './mailer.js'

export class EmailDeliveryError extends Error {
  constructor(category, message, cause) {
    super(message)
    this.name = 'EmailDeliveryError'
    this.category = category
    this.cause = cause
  }
}

const timestamp = () => new Date().toISOString()
const result = (provider, status, messageId, category = null) => ({
  provider, status, messageId: messageId || null, requestedAt: timestamp(), category,
})

export function validateEmailConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  const provider = String(env.EMAIL_PROVIDER || '').trim().toLowerCase()
  const frontend = String(env.FRONTEND_URL || '').trim()
  const errors = []
  if (production && !frontend) errors.push('FRONTEND_URL is required in production')
  if (frontend) {
    try {
      const url = new URL(frontend)
      if (production && url.protocol !== 'https:') errors.push('FRONTEND_URL must use HTTPS in production')
    } catch { errors.push('FRONTEND_URL must be a valid URL') }
  }
  if (production && !provider) errors.push('EMAIL_PROVIDER is required in production')
  if (production && !env.EMAIL_FROM) errors.push('EMAIL_FROM is required in production')
  if (provider === 'smtp' && (!env.SMTP_HOST || !env.SMTP_PORT)) errors.push('SMTP_HOST and SMTP_PORT are required for SMTP')
  if (provider === 'resend' && !env.RESEND_API_KEY) errors.push('RESEND_API_KEY is required for Resend')
  if (provider && !['mock', 'smtp', 'resend'].includes(provider)) errors.push(`Unsupported EMAIL_PROVIDER: ${provider}`)
  return errors
}

export function assertEmailConfig(env = process.env) {
  const errors = validateEmailConfig(env)
  if (errors.length) throw new Error(`Invalid email configuration: ${errors.join('; ')}`)
}

function messageId() { return `email_${randomUUID()}` }

export function createMockEmailProvider() {
  const outbox = []
  return {
    kind: 'mock',
    outbox,
    async send(message) {
      const id = messageId()
      outbox.push({ ...message, messageId: id })
      return result('mock', 'accepted', id)
    },
  }
}

function classify(error) {
  const message = String(error?.message || error)
  if (/auth|535|authentication/i.test(message)) return 'authentication'
  if (/timeout|timed out/i.test(message)) return 'timeout'
  if (/reject|5\d\d|4\d\d/i.test(message)) return 'rejected'
  return 'connection'
}

export function createSmtpEmailProvider(env = process.env) {
  const port = Number(env.SMTP_PORT) || 587
  const cfg = { host: env.SMTP_HOST, port, secure: env.SMTP_SECURE === 'true' || port === 465, user: env.SMTP_USER, pass: env.SMTP_PASS }
  return {
    kind: 'smtp',
    async send(message) {
      const id = messageId()
      try {
        await smtpSend(cfg, { from: env.EMAIL_FROM || env.MAIL_FROM, to: message.to, message: buildMessage({ from: env.EMAIL_FROM || env.MAIL_FROM, ...message }) })
        return result('smtp', 'accepted', id)
      } catch (error) {
        throw new EmailDeliveryError(classify(error), 'SMTP delivery request failed', error)
      }
    },
  }
}

export function createResendEmailProvider(env = process.env) {
  return {
    kind: 'resend',
    async send(message) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), Number(env.EMAIL_TIMEOUT_MS) || 10_000)
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
          body: JSON.stringify({ from: env.EMAIL_FROM, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
          signal: controller.signal,
        })
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new EmailDeliveryError(response.status >= 500 ? 'provider' : 'rejected', 'Email provider rejected the request', body)
        return result('resend', 'accepted', body.id)
      } catch (error) {
        if (error instanceof EmailDeliveryError) throw error
        throw new EmailDeliveryError(error?.name === 'AbortError' ? 'timeout' : 'connection', 'Email provider request failed', error)
      } finally {
        clearTimeout(timer)
      }
    },
  }
}

export function createEmailProvider(env = process.env) {
  const provider = String(env.EMAIL_PROVIDER || '').trim().toLowerCase()
  if (provider === 'mock') return createMockEmailProvider()
  if (provider === 'smtp') return createSmtpEmailProvider(env)
  if (provider === 'resend') return createResendEmailProvider(env)
  if (env.NODE_ENV === 'production') assertEmailConfig(env)
  return createMockEmailProvider()
}
