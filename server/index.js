import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { openDb } from './db.js'
import { registerUser, verifyUser, issueToken, userFromAuth, revoke, createEmailToken, createVerificationChallenge, verificationResendAllowed, allowVerificationRetry, consumeVerificationCode, consumeVerificationLink, consumeEmailToken, markVerified, setPassword, setEmail, findByEmail, getUser, validPassword } from './auth.js'
import { createEmailProvider, assertEmailConfig, EmailDeliveryError } from './emailService.js'
import * as tpl from './emailTemplates.js'
import { search } from './coach/retriever.js'
import { getProvider } from './coach/provider.js'
import { validateLoadedState } from '@/services/progression/engine'

const MAX_BODY = 2 * 1024 * 1024
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' }

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}
async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const c of req) {
    size += c.length
    if (size > MAX_BODY) throw Object.assign(new Error('too-large'), { status: 413 })
    chunks.push(c)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { throw Object.assign(new Error('bad-json'), { status: 400 }) }
}

export function createApp({ db = openDb(), staticDir, mailer = null, emailProvider = null, appUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173', authLimit = 20 } = {}) {
  if (process.env.NODE_ENV === 'production') assertEmailConfig()
  const delivery = emailProvider || mailer || createEmailProvider()
  const attempts = new Map()
  const limited = (ip) => {
    const t = Date.now()
    const a = attempts.get(ip)
    if (!a || a.reset < t) { attempts.set(ip, { n: 1, reset: t + 15 * 60_000 }); return false }
    return ++a.n > authLimit
  }
  const link = (page, token) => `${appUrl.replace(/\/$/, '')}/#/${page}?token=${token}`
  const mail = async (to, msg) => delivery.send({ to, ...msg })
  const deliveryInfo = (r = {}) => ({ provider: r.provider || delivery.kind || 'unknown', status: r.status || 'accepted', messageId: r.messageId || null })
  const sendVerification = (u) => {
    const challenge = createVerificationChallenge(db, u.userId)
    const verificationLink = link('verify', challenge.linkToken)
    return mail(u.email, tpl.verifyEmail({ name: u.username, link: verificationLink, otp: challenge.otp }))
  }
  const me = (u) => ({ username: u.username, email: u.email, verified: Boolean(u.verifiedAt) })
  const STATUS = { 'invalid-credentials': 401, 'username-taken': 409, 'email-taken': 409 }

  return async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x')
      const route = `${req.method} ${url.pathname}`
      if (!url.pathname.startsWith('/api/')) return serveStatic(staticDir, url.pathname, res)
      if (route === 'GET /api/health') return send(res, 200, { ok: true })

      const publicAuth = ['POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/verify', 'POST /api/auth/forgot', 'POST /api/auth/reset']
      if (publicAuth.includes(route)) {
        if (limited(req.socket.remoteAddress)) return send(res, 429, { error: 'too-many-attempts' })
        const body = await readJson(req)
        if (route.endsWith('/register') || route.endsWith('/login')) {
          const r = route.endsWith('/register') ? registerUser(db, body.username, body.password, body.email) : verifyUser(db, body.username, body.password)
          if (r.error) return send(res, STATUS[r.error] || 400, { error: r.error })
          if (route.endsWith('/register')) {
            let emailDelivery
            try { emailDelivery = await sendVerification(r) } catch (error) {
              allowVerificationRetry(db, r.userId)
              const category = error instanceof EmailDeliveryError ? error.category : 'unknown'
              return send(res, 503, { error: 'email-delivery-failed', category })
            }
            return send(res, 200, { token: issueToken(db, r.userId), ...me(r), emailDelivery: deliveryInfo(emailDelivery) })
          }
          return send(res, 200, { token: issueToken(db, r.userId), ...me(r) })
        }
        if (route.endsWith('/forgot')) { // same response whether or not the account exists
          const u = findByEmail(db, body.email)
          if (u) {
            try { await mail(u.email, tpl.resetEmail({ name: u.username, link: link('reset', createEmailToken(db, u.userId, 'reset', 3600e3)) })) } catch { /* preserve non-enumeration */ }
          }
          return send(res, 200, { ok: true })
        }
        if (route.endsWith('/verify')) {
          const uid = consumeVerificationLink(db, body.token)
          if (!uid) return send(res, 400, { error: 'invalid-or-expired' })
          return send(res, 200, { ok: true, verified: true })
        }
        if (!validPassword(body.password)) return send(res, 400, { error: 'weak-password' })
        const uid = consumeEmailToken(db, body.token, 'reset')
        if (!uid) return send(res, 400, { error: 'invalid-or-expired' })
        setPassword(db, uid, body.password)
        markVerified(db, uid) // clicking the emailed link proves ownership
        const u = getUser(db, uid)
        if (u?.email) { try { await mail(u.email, tpl.passwordChangedEmail({ name: u.username })) } catch { /* password reset already succeeded */ } }
        return send(res, 200, { ok: true })
      }

      const user = userFromAuth(db, req.headers.authorization)
      if (!user) return send(res, 401, { error: 'unauthorized' })

      if (route === 'POST /api/auth/logout') { revoke(db, req.headers.authorization); return send(res, 200, { ok: true }) }
      if (route === 'GET /api/me') return send(res, 200, me(user))
      if (route === 'POST /api/auth/verify-otp') {
        if (limited(req.socket.remoteAddress)) return send(res, 429, { error: 'too-many-attempts' })
        const result = consumeVerificationCode(db, user.userId, (await readJson(req)).code)
        if (!result.ok) return send(res, result.error === 'too-many-attempts' ? 429 : 400, { error: result.error })
        return send(res, 200, { ok: true, verified: true })
      }
      if (route === 'POST /api/auth/resend') {
        if (limited(req.socket.remoteAddress)) return send(res, 429, { error: 'too-many-attempts' })
        if (!user.email) return send(res, 400, { error: 'bad-email' })
        if (user.verifiedAt) return send(res, 200, { ok: true, alreadyVerified: true })
        if (!verificationResendAllowed(db, user.userId)) return send(res, 429, { error: 'resend-cooldown' })
        let emailDelivery
        try { emailDelivery = await sendVerification(user) } catch (error) {
          allowVerificationRetry(db, user.userId)
          const category = error instanceof EmailDeliveryError ? error.category : 'unknown'
          return send(res, 503, { error: 'email-delivery-failed', category })
        }
        return send(res, 200, { ok: true, emailDelivery: deliveryInfo(emailDelivery) })
      }
      if (route === 'POST /api/auth/email') {
        if (limited(req.socket.remoteAddress)) return send(res, 429, { error: 'too-many-attempts' })
        const r = setEmail(db, user.userId, (await readJson(req)).email)
        if (r.error) return send(res, STATUS[r.error] || 400, { error: r.error })
        try { await sendVerification({ ...user, email: r.email }) } catch (error) {
          allowVerificationRetry(db, user.userId)
          const category = error instanceof EmailDeliveryError ? error.category : 'unknown'
          return send(res, 503, { error: 'email-delivery-failed', category })
        }
        return send(res, 200, { ok: true, email: r.email, verified: false })
      }
      if (route === 'GET /api/save') {
        const row = db.prepare('select state, updated_at, revision, device_id from saves where user_id=?').get(user.userId)
        return send(res, 200, row ? { state: JSON.parse(row.state), updatedAt: row.updated_at, revision: row.revision, deviceId: row.device_id } : { state: null, revision: 0 })
      }
      if (route === 'PUT /api/save') {
        // Optimistic concurrency: a write is accepted only if the client saw the latest revision.
        // A stale device can therefore never silently overwrite newer progress; it must choose explicitly (force).
        const { state, baseRevision, force, deviceId } = await readJson(req)
        if (!validateLoadedState(state)) return send(res, 400, { error: 'invalid-state' })
        if (!force && !Number.isInteger(baseRevision)) return send(res, 400, { error: 'base-revision-required' })
        const at = new Date().toISOString()
        const dev = typeof deviceId === 'string' ? deviceId.slice(0, 64) : null
        const row = db.prepare('select revision, updated_at, device_id from saves where user_id=?').get(user.userId)
        let changed
        if (!row) {
          changed = db.prepare('insert into saves(user_id,state,updated_at,revision,device_id) values(?,?,?,1,?) on conflict(user_id) do nothing').run(user.userId, JSON.stringify(state), at, dev).changes
        } else if (force) {
          changed = db.prepare('update saves set state=?, updated_at=?, revision=revision+1, device_id=? where user_id=?').run(JSON.stringify(state), at, dev, user.userId).changes
        } else {
          changed = db.prepare('update saves set state=?, updated_at=?, revision=revision+1, device_id=? where user_id=? and revision=?').run(JSON.stringify(state), at, dev, user.userId, baseRevision).changes
        }
        if (!changed) {
          const cur = db.prepare('select revision, updated_at, device_id from saves where user_id=?').get(user.userId)
          return send(res, 409, { error: 'conflict', serverRevision: cur.revision, updatedAt: cur.updated_at, deviceId: cur.device_id })
        }
        const cur = db.prepare('select revision from saves where user_id=?').get(user.userId)
        return send(res, 200, { ok: true, updatedAt: at, revision: cur.revision })
      }
      if (route === 'POST /api/coach') {
        if (!user.verifiedAt) return send(res, 403, { error: 'email-not-verified' })
        const { question, gateId } = await readJson(req)
        const q = String(question || '').trim().slice(0, 500)
        if (q.length < 3) return send(res, 400, { error: 'question-too-short' })
        const provider = getProvider()
        return send(res, 200, { ...(await provider.answer({ question: q, passages: search(q, { gateId }), context: { gateId } })), provider: provider.name })
      }
      return send(res, 404, { error: 'not-found' })
    } catch (e) {
      return send(res, e.status || 500, { error: e.status ? e.message : 'server-error' })
    }
  }
}

async function serveStatic(dir, pathname, res) {
  if (!dir) { res.writeHead(404); return res.end() }
  const file = path.join(dir, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''))
  const target = file.startsWith(dir) && path.extname(file) ? file : path.join(dir, 'index.html')
  try {
    const data = await readFile(target)
    res.writeHead(200, { 'content-type': MIME[path.extname(target)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404); res.end()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  if (process.env.NODE_ENV === 'production') assertEmailConfig()
  const port = Number(process.env.PORT) || 8787
  const staticDir = path.resolve('dist')
  http.createServer(createApp({ staticDir })).listen(port, () => console.log(`Mythic Levels API on http://localhost:${port}`))
}
