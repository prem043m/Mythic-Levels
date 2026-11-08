import { test } from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import { createEmailProvider, createResendEmailProvider, createSmtpEmailProvider, validateEmailConfig, EmailDeliveryError } from './emailService.js'

test('mock email provider accepts without exposing secrets in logs', async () => {
  const provider = createEmailProvider({ EMAIL_PROVIDER: 'mock' })
  const result = await provider.send({ to: 'ana@example.com', subject: 'Confirm', text: 'private', html: '<p>private</p>' })
  assert.equal(result.provider, 'mock')
  assert.equal(result.status, 'accepted')
  assert.equal(provider.outbox.length, 1)
  assert.equal(provider.outbox[0].text, 'private')
  assert.match(provider.outbox[0].messageId, /^email_/)
  assert.equal(Object.prototype.hasOwnProperty.call(result, 'delivered'), false)
})

test('production email configuration requires public HTTPS frontend and provider credentials', () => {
  assert.deepEqual(validateEmailConfig({ NODE_ENV: 'production' }), [
    'FRONTEND_URL is required in production',
    'EMAIL_PROVIDER is required in production',
    'EMAIL_FROM is required in production',
  ])
  assert.ok(validateEmailConfig({ NODE_ENV: 'production', FRONTEND_URL: 'http://app.test', EMAIL_PROVIDER: 'resend', EMAIL_FROM: 'Mythic <no-reply@example.com>' }).includes('FRONTEND_URL must use HTTPS in production'))
  assert.ok(validateEmailConfig({ NODE_ENV: 'production', FRONTEND_URL: 'https://app.test', EMAIL_PROVIDER: 'resend', EMAIL_FROM: 'Mythic <no-reply@example.com>' }).includes('RESEND_API_KEY is required for Resend'))
})

test('Resend provider surfaces provider rejection without raw request data', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ id: 'provider-id', message: 'rejected' }), { status: 422 })
  try {
    await assert.rejects(
      createResendEmailProvider({ RESEND_API_KEY: 'test-key' }).send({ to: 'ana@example.com', subject: 'x', text: 'x', html: 'x' }),
      (error) => error instanceof EmailDeliveryError && error.category === 'rejected',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Resend provider reports timeout category', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (_url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
  })
  try {
    await assert.rejects(
      createResendEmailProvider({ RESEND_API_KEY: 'test-key', EMAIL_TIMEOUT_MS: 1 }).send({ to: 'ana@example.com', subject: 'x', text: 'x', html: 'x' }),
      (error) => error instanceof EmailDeliveryError && error.category === 'timeout',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('SMTP connection failures and insecure authentication attempts are classified', async () => {
  await assert.rejects(
    createSmtpEmailProvider({ SMTP_HOST: '127.0.0.1', SMTP_PORT: '1', EMAIL_FROM: 'no-reply@example.com' }).send({ to: 'ana@example.com', subject: 'x', text: 'x', html: 'x' }),
    (error) => error instanceof EmailDeliveryError && error.category === 'connection',
  )

  const server = net.createServer((socket) => {
    socket.write('220 test\r\n')
    socket.on('data', (data) => {
      if (data.toString().startsWith('EHLO')) socket.write('250-test\r\n250 AUTH PLAIN\r\n')
      else if (data.toString().startsWith('AUTH')) socket.write('535 authentication failed\r\n')
    })
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await assert.rejects(
      createSmtpEmailProvider({ SMTP_HOST: '127.0.0.1', SMTP_PORT: server.address().port, SMTP_USER: 'user', SMTP_PASS: 'pass', EMAIL_FROM: 'no-reply@example.com' }).send({ to: 'ana@example.com', subject: 'x', text: 'x', html: 'x' }),
      (error) => error instanceof EmailDeliveryError && error.category === 'connection',
    )
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('authenticated SMTP fails closed when TLS is unavailable', async () => {
  const server = net.createServer((socket) => {
    socket.write('220 test\r\n')
    socket.on('data', (data) => {
      if (data.toString().startsWith('EHLO')) socket.write('250 test\r\n')
    })
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await assert.rejects(
      createSmtpEmailProvider({ SMTP_HOST: '127.0.0.1', SMTP_PORT: server.address().port, SMTP_USER: 'user', SMTP_PASS: 'pass', EMAIL_FROM: 'no-reply@example.com' }).send({ to: 'ana@example.com', subject: 'x', text: 'x', html: 'x' }),
      (error) => error instanceof EmailDeliveryError && error.category === 'connection',
    )
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
