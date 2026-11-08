import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createApp } from './index.js'
import { openDb } from './db.js'
import { createVerificationChallenge, consumeVerificationCode, verificationResendAllowed } from './auth.js'
import { createInitialState } from '@/services/progression/engine'

let server, base
const outbox = []
before(async () => {
  const mailer = { outbox, async send(m) { outbox.push(m) } }
  server = http.createServer(createApp({ db: openDb(':memory:'), mailer, appUrl: 'http://app.test', authLimit: 1000 }))
  await new Promise((r) => server.listen(0, r))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())

const call = async (method, path, body, token) => {
  const res = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) })
  return { status: res.status, body: await res.json() }
}
const tokenIn = (mail) => /token=([a-f0-9]{64})/.exec(mail.text)[1]
const good = { username: 'Ana', password: 'longenough', email: 'Ana@Example.com' }

test('OTP verification enforces expiry, attempts, cooldown, and single use', () => {
  const db = openDb(':memory:')
  const created = db.prepare('insert into users(username,salt,hash,created_at,email) values(?,?,?,?,?)').run('otp-user', 'salt', 'hash', new Date().toISOString(), 'otp@example.com')
  const userId = Number(created.lastInsertRowid)
  const challenge = createVerificationChallenge(db, userId)
  assert.equal(challenge.otp.length, 6)
  assert.equal(verificationResendAllowed(db, userId), false)
  const replacement = createVerificationChallenge(db, userId)
  assert.equal(consumeVerificationCode(db, userId, challenge.otp).error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, replacement.otp).ok, true)
  createVerificationChallenge(db, userId)
  assert.equal(consumeVerificationCode(db, userId, '000000').error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '111111').error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '222222').error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '333333').error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '444444').error, 'too-many-attempts')
  assert.equal(consumeVerificationCode(db, userId, challenge.otp).error, 'too-many-attempts')
  const expired = createVerificationChallenge(db, userId, -1)
  assert.equal(consumeVerificationCode(db, userId, expired.otp).error, 'invalid-or-expired')
  const second = db.prepare('insert into users(username,salt,hash,created_at,email) values(?,?,?,?,?)').run('otp-user-2', 'salt', 'hash', new Date().toISOString(), 'otp2@example.com')
  const secondId = Number(second.lastInsertRowid)
  const valid = createVerificationChallenge(db, secondId)
  assert.deepEqual(consumeVerificationCode(db, secondId, valid.otp), { ok: true, userId: secondId })
  assert.equal(consumeVerificationCode(db, secondId, valid.otp).error, 'invalid-or-expired')
})

test('registration validation and duplicates', async () => {
  assert.equal((await call('POST', '/api/auth/register', { ...good, username: 'ab' })).status, 400)
  assert.equal((await call('POST', '/api/auth/register', { ...good, email: 'nope' })).body.error, 'bad-email')
  assert.equal((await call('POST', '/api/auth/register', { ...good, password: 'short' })).body.error, 'weak-password')
  assert.equal((await call('POST', '/api/auth/register', good)).status, 200)
  assert.equal((await call('POST', '/api/auth/register', good)).status, 409)
  assert.equal((await call('POST', '/api/auth/register', { ...good, username: 'other' })).body.error, 'email-taken')
})

test('registration and resend propagate email delivery failures safely', async () => {
  const failing = { async send() { throw new Error('provider unavailable') } }
  const isolated = http.createServer(createApp({ db: openDb(':memory:'), emailProvider: failing, appUrl: 'https://app.test', authLimit: 1000 }))
  await new Promise((r) => isolated.listen(0, r))
  const origin = `http://127.0.0.1:${isolated.address().port}`
  const isolatedCall = async (method, path, body, token) => {
    const res = await fetch(origin + path, { method, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) })
    return { status: res.status, body: await res.json() }
  }
  const created = await isolatedCall('POST', '/api/auth/register', { username: 'Failing', password: 'longenough', email: 'failing@example.com' })
  assert.equal(created.status, 503)
  assert.equal(created.body.error, 'email-delivery-failed')
  const login = await isolatedCall('POST', '/api/auth/login', { username: 'failing', password: 'longenough' })
  assert.equal((await isolatedCall('POST', '/api/auth/resend', {}, login.body.token)).status, 503)
  await new Promise((resolve) => isolated.close(resolve))
})

test('a failed registration delivery leaves the account recoverable for resend', async () => {
  let fail = true
  const messages = []
  const provider = {
    kind: 'mock',
    async send(message) {
      if (fail) throw new Error('temporary provider failure')
      messages.push(message)
      return { provider: 'mock', status: 'accepted', messageId: `mock-${messages.length}` }
    },
  }
  const isolated = http.createServer(createApp({ db: openDb(':memory:'), emailProvider: provider, appUrl: 'https://app.test', authLimit: 1000 }))
  await new Promise((r) => isolated.listen(0, r))
  const origin = `http://127.0.0.1:${isolated.address().port}`
  const isolatedCall = async (method, path, body, token) => {
    const headers = { 'content-type': 'application/json' }
    if (token) headers.authorization = ['Bearer', token].join(' ')
    const res = await fetch(origin + path, { method, headers, body: body && JSON.stringify(body) })
    return { status: res.status, body: await res.json() }
  }
  const registration = await isolatedCall('POST', '/api/auth/register', { username: 'Recoverable', password: 'longenough', email: 'recoverable@example.com' })
  assert.equal(registration.status, 503)
  assert.equal((await isolatedCall('POST', '/api/auth/register', { username: 'Recoverable', password: 'longenough', email: 'recoverable@example.com' })).status, 409)

  const login = await isolatedCall('POST', '/api/auth/login', { username: 'recoverable', password: 'longenough' })
  assert.equal(login.status, 200)
  fail = false
  const resend = await isolatedCall('POST', '/api/auth/resend', {}, login.body.token)
  assert.equal(resend.status, 200)
  assert.equal(messages.length, 1)
  assert.equal(messages[0].to, 'recoverable@example.com')
  await new Promise((resolve) => isolated.close(resolve))
})

test('email verification gates the coach; save roundtrip works', async () => {
  const mail = outbox.find((m) => m.to === 'ana@example.com' && /Confirm/.test(m.subject))
  assert.ok(mail && mail.html.includes('http://app.test/#/verify?token='))
  const login = await call('POST', '/api/auth/login', { username: 'ANA@example.com', password: 'longenough' }) // by email
  assert.equal(login.status, 200)
  assert.equal(login.body.verified, false)
  const { token } = login.body

  assert.equal((await call('GET', '/api/save')).status, 401)
  assert.equal((await call('PUT', '/api/save', { state: { nope: true } }, token)).status, 400)
  const first = await call('PUT', '/api/save', { state: createInitialState({ name: 'Ana' }), baseRevision: 0, deviceId: 'phone' }, token)
  assert.equal(first.status, 200)
  assert.equal(first.body.revision, 1)
  assert.equal((await call('GET', '/api/save', null, token)).body.state.player.name, 'Ana')

  const q = { question: 'How do I stop being distracted and keep my attention?' }
  assert.equal((await call('POST', '/api/coach', q, token)).body.error, 'email-not-verified')
  assert.equal((await call('POST', '/api/auth/verify', { token: 'f'.repeat(64) })).status, 400)
  assert.equal((await call('POST', '/api/auth/resend', {}, token)).status, 429)
  assert.equal((await call('POST', '/api/auth/verify', { token: 'f'.repeat(64) }, token)).status, 400)
  assert.equal((await call('POST', '/api/auth/verify', { token: tokenIn(mail) }, token)).status, 200)
  assert.equal((await call('POST', '/api/auth/verify', { token: tokenIn(mail) }, token)).status, 400) // single use
  assert.equal((await call('GET', '/api/me', null, token)).body.verified, true)
  const coach = await call('POST', '/api/coach', q, token)
  assert.equal(coach.status, 200)
  assert.ok(coach.body.sources.length > 0)
})

test('password reset: no enumeration, single use, signs out everywhere, notifies', async () => {
  const before = outbox.length
  assert.equal((await call('POST', '/api/auth/forgot', { email: 'ghost@example.com' })).status, 200)
  assert.equal(outbox.length, before) // nothing sent for unknown address
  const oldSession = (await call('POST', '/api/auth/login', { username: 'ana', password: 'longenough' })).body.token

  assert.equal((await call('POST', '/api/auth/forgot', { email: 'ana@example.com' })).status, 200)
  const reset = outbox.at(-1)
  assert.match(reset.subject, /Reset/)
  const token = tokenIn(reset)
  assert.equal((await call('POST', '/api/auth/reset', { token, password: 'short' })).body.error, 'weak-password')
  assert.equal((await call('POST', '/api/auth/reset', { token, password: 'brandnewpass' })).status, 200)
  assert.equal((await call('POST', '/api/auth/reset', { token, password: 'anotherpass1' })).status, 400) // single use
  assert.match(outbox.at(-1).subject, /changed/)

  assert.equal((await call('GET', '/api/me', null, oldSession)).status, 401)
  assert.equal((await call('POST', '/api/auth/login', { username: 'ana', password: 'longenough' })).status, 401)
  const again = await call('POST', '/api/auth/login', { username: 'ana', password: 'brandnewpass' })
  assert.equal(again.status, 200)
  await call('POST', '/api/auth/logout', {}, again.body.token)
  assert.equal((await call('GET', '/api/me', null, again.body.token)).status, 401)
})

test('changing email requires re-verification', async () => {
  const { token } = (await call('POST', '/api/auth/login', { username: 'ana', password: 'brandnewpass' })).body
  assert.equal((await call('POST', '/api/auth/email', { email: 'new@example.com' }, token)).body.verified, false)
  assert.equal((await call('GET', '/api/me', null, token)).body.verified, false)
  assert.equal(outbox.at(-1).to, 'new@example.com')
})

test('sync never silently overwrites a newer save (optimistic concurrency)', async () => {
  const { token } = (await call('POST', '/api/auth/login', { username: 'ana', password: 'brandnewpass' })).body
  const mk = (name) => createInitialState({ name })
  const cur = (await call('GET', '/api/save', null, token)).body.revision // revision seen by both devices
  const a = await call('PUT', '/api/save', { state: mk('FromPhone'), baseRevision: cur, deviceId: 'phone' }, token)
  assert.equal(a.status, 200)
  const stale = await call('PUT', '/api/save', { state: mk('FromLaptop'), baseRevision: cur, deviceId: 'laptop' }, token) // laptop never saw the phone's save
  assert.equal(stale.status, 409)
  assert.equal(stale.body.error, 'conflict')
  assert.equal(stale.body.serverRevision, a.body.revision)
  assert.equal(stale.body.deviceId, 'phone')
  assert.equal((await call('GET', '/api/save', null, token)).body.state.player.name, 'FromPhone') // nothing was overwritten
  assert.equal((await call('PUT', '/api/save', { state: mk('x') }, token)).body.error, 'base-revision-required')
  const forced = await call('PUT', '/api/save', { state: mk('FromLaptop'), force: true, deviceId: 'laptop' }, token) // explicit user decision
  assert.equal(forced.status, 200)
  assert.equal(forced.body.revision, a.body.revision + 1)
})
