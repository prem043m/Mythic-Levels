import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { createHash, createHmac } from 'node:crypto'
import { createApp } from './index.js'
import { migrateDb, openDb } from './db.js'
import { createVerificationChallenge, consumeVerificationCode, verificationResendAllowed, registerUser, issueToken, userFromAuth } from './auth.js'
import { requireOtpVerifierSecret, resolveSessionTtlSeconds } from './securityConfig.js'
import { createInitialState } from '@/services/progression/engine'

let server, base
const outbox = []
const OTP_TEST_SECRET = 'test-only-otp-verifier-secret-with-32-bytes'
const testApp = (options) => createApp({ otpVerifierSecret: OTP_TEST_SECRET, ...options })
before(async () => {
  const mailer = { outbox, async send(m) { outbox.push(m) } }
  server = http.createServer(testApp({ db: openDb(':memory:'), mailer, appUrl: 'http://app.test', authLimit: 1000 }))
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

test('gitignore protects environment secrets, local data, and generated files while preserving the example', async () => {
  const contents = await readFile(new URL('../.gitignore', import.meta.url), 'utf8')
  const rules = contents.split(/\r?\n/).map((rule) => rule.trim())

  assert.ok(rules.includes('.env'))
  assert.ok(rules.includes('.env.*'))
  assert.ok(rules.indexOf('!.env.example') > rules.indexOf('.env.*'))
  assert.ok(rules.includes('server/data/'))
  assert.ok(rules.includes('node_modules'))
  assert.ok(rules.includes('dist'))
})

test('root and API base expose public API discovery instead of the frontend', async () => {
  for (const path of ['/', '/api']) {
    const r = await call('GET', path)
    assert.equal(r.status, 200)
    assert.equal(r.body.service, 'MYTHIC LEVELS API')
    assert.equal(r.body.apiBase, '/api')
    assert.ok(r.body.endpoints.some((endpoint) => endpoint.method === 'GET' && endpoint.path === '/api/health' && endpoint.access === 'public'))
    assert.ok(r.body.endpoints.some((endpoint) => endpoint.method === 'POST' && endpoint.path === '/api/auth/register' && endpoint.access === 'public'))
  }
  assert.deepEqual((await call('GET', '/api/health')).body, { ok: true })
})

test('malformed JSON and non-object request bodies return safe HTTP 400 responses', async () => {
  const callRaw = async (raw) => {
    const response = await fetch(`${base}/api/auth/forgot`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: raw,
    })
    return { status: response.status, body: await response.json() }
  }

  for (const raw of ['{', 'null', '[]', '"text"', '1', 'true', 'false']) {
    const response = await callRaw(raw)
    assert.equal(response.status, 400, raw)
    assert.ok(['bad-json', 'invalid-request-body'].includes(response.body.error), raw)
    assert.equal(Object.prototype.hasOwnProperty.call(response.body, 'stack'), false)
  }

  assert.equal((await call('POST', '/api/auth/forgot', { email: 'absent@example.com' })).status, 200)
})

test('unexpected internal errors return sanitized HTTP 500 responses', async () => {
  const isolated = http.createServer(testApp({
    db: { prepare() { throw new Error('private database detail') } },
  }))
  await new Promise((resolve) => isolated.listen(0, resolve))

  try {
    const response = await fetch(`http://127.0.0.1:${isolated.address().port}/api/me`, {
      headers: { authorization: `Bearer ${'a'.repeat(64)}` },
    })
    const text = await response.text()
    assert.equal(response.status, 500)
    assert.equal(text, '{"error":"server-error"}')
    assert.doesNotMatch(text, /private database detail|stack|Error/)
  } finally {
    await new Promise((resolve) => isolated.close(resolve))
  }
})

test('OTP verification enforces expiry, attempts, cooldown, and single use', () => {
  const db = openDb(':memory:')
  const created = db.prepare('insert into users(username,salt,hash,created_at,email) values(?,?,?,?,?)').run('otp-user', 'salt', 'hash', new Date().toISOString(), 'otp@example.com')
  const userId = Number(created.lastInsertRowid)
  const challenge = createVerificationChallenge(db, userId, undefined, OTP_TEST_SECRET)
  assert.equal(challenge.otp.length, 6)
  assert.equal(verificationResendAllowed(db, userId), false)
  const replacement = createVerificationChallenge(db, userId, undefined, OTP_TEST_SECRET)
  assert.equal(consumeVerificationCode(db, userId, challenge.otp, OTP_TEST_SECRET).error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, replacement.otp, OTP_TEST_SECRET).ok, true)
  createVerificationChallenge(db, userId, undefined, OTP_TEST_SECRET)
  assert.equal(consumeVerificationCode(db, userId, '000000', OTP_TEST_SECRET).error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '111111', OTP_TEST_SECRET).error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '222222', OTP_TEST_SECRET).error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '333333', OTP_TEST_SECRET).error, 'invalid-code')
  assert.equal(consumeVerificationCode(db, userId, '444444', OTP_TEST_SECRET).error, 'too-many-attempts')
  assert.equal(consumeVerificationCode(db, userId, challenge.otp, OTP_TEST_SECRET).error, 'too-many-attempts')
  const expired = createVerificationChallenge(db, userId, -1, OTP_TEST_SECRET)
  assert.equal(consumeVerificationCode(db, userId, expired.otp, OTP_TEST_SECRET).error, 'invalid-or-expired')
  const second = db.prepare('insert into users(username,salt,hash,created_at,email) values(?,?,?,?,?)').run('otp-user-2', 'salt', 'hash', new Date().toISOString(), 'otp2@example.com')
  const secondId = Number(second.lastInsertRowid)
  const valid = createVerificationChallenge(db, secondId, undefined, OTP_TEST_SECRET)
  assert.deepEqual(consumeVerificationCode(db, secondId, valid.otp, OTP_TEST_SECRET), { ok: true, userId: secondId })
  assert.equal(consumeVerificationCode(db, secondId, valid.otp, OTP_TEST_SECRET).error, 'invalid-or-expired')
})

test('OTP codes are stored as user-bound HMAC verifiers and configuration fails closed', () => {
  const db = openDb(':memory:')
  const created = db.prepare('insert into users(username,salt,hash,created_at,email) values(?,?,?,?,?)').run('hmac-user', 'salt', 'hash', new Date().toISOString(), 'hmac@example.com')
  const userId = Number(created.lastInsertRowid)
  const challenge = createVerificationChallenge(db, userId, undefined, OTP_TEST_SECRET)
  const row = db.prepare('select hash, verifier_version from verification_codes where user_id=?').get(userId)
  const expected = createHmac('sha256', OTP_TEST_SECRET)
    .update(`mythic-levels:email-verification-otp:v1:${userId}:${challenge.otp}`)
    .digest('hex')

  assert.equal(row.hash, expected)
  assert.notEqual(row.hash, createHash('sha256').update(challenge.otp).digest('hex'))
  assert.notEqual(row.hash, createHmac('sha256', OTP_TEST_SECRET)
    .update(`mythic-levels:email-verification-otp:v1:${userId + 1}:${challenge.otp}`)
    .digest('hex'))
  assert.equal(row.verifier_version, 1)
  assert.equal(consumeVerificationCode(db, userId, challenge.otp, 'wrong-key-that-is-at-least-32-bytes').error, 'invalid-code')
  assert.equal(db.prepare('select attempts from verification_codes where user_id=?').get(userId).attempts, 1)
  assert.deepEqual(consumeVerificationCode(db, userId, challenge.otp, OTP_TEST_SECRET), { ok: true, userId })

  assert.equal(resolveSessionTtlSeconds('2592000'), 30 * 24 * 60 * 60)
  assert.throws(() => resolveSessionTtlSeconds('0'), /SESSION_TTL_SECONDS/)
  assert.throws(() => requireOtpVerifierSecret(null), /OTP_VERIFIER_SECRET/)
  assert.throws(() => requireOtpVerifierSecret('too-short'), /OTP_VERIFIER_SECRET/)
  assert.throws(() => createApp({ db: openDb(':memory:'), otpVerifierSecret: null }), /OTP_VERIFIER_SECRET/)
})

test('database migration backfills session expiry and invalidates outstanding legacy OTP verifiers', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(`
    create table tokens(hash text primary key, user_id integer not null, created_at text not null);
    create table verification_codes(user_id integer primary key, hash text not null, expires_at text not null, attempts integer not null default 0, sent_at text not null);
    create table email_tokens(hash text primary key, user_id integer not null, purpose text not null, expires_at text not null);
  `)
  const nowMs = Date.now()
  const activeCreatedAt = new Date(nowMs - 60_000).toISOString()
  const expiredCreatedAt = new Date(nowMs - 2 * 60 * 60_000).toISOString()
  db.prepare('insert into tokens(hash,user_id,created_at) values(?,?,?)').run('a'.repeat(64), 1, activeCreatedAt)
  db.prepare('insert into tokens(hash,user_id,created_at) values(?,?,?)').run('b'.repeat(64), 2, expiredCreatedAt)
  db.prepare('insert into tokens(hash,user_id,created_at) values(?,?,?)').run('c'.repeat(64), 3, 'not-a-date')
  db.prepare('insert into verification_codes(user_id,hash,expires_at,attempts,sent_at) values(?,?,?,?,?)')
    .run(1, 'd'.repeat(64), new Date(nowMs + 600_000).toISOString(), 0, new Date(nowMs).toISOString())
  db.prepare('insert into email_tokens(hash,user_id,purpose,expires_at) values(?,?,?,?)')
    .run('e'.repeat(64), 1, 'verify', new Date(nowMs + 30 * 60_000).toISOString())

  migrateDb(db, 3600)

  const active = db.prepare('select expires_at from tokens where hash=?').get('a'.repeat(64))
  const expired = db.prepare('select expires_at from tokens where hash=?').get('b'.repeat(64))
  assert.equal(Date.parse(active.expires_at), Date.parse(activeCreatedAt) + 3600_000)
  assert.ok(Date.parse(expired.expires_at) <= nowMs)
  assert.equal(db.prepare('select hash from tokens where hash=?').get('c'.repeat(64)), undefined)
  assert.equal(db.prepare('select count(*) as count from verification_codes').get().count, 0)
  assert.equal(db.prepare('select count(*) as count from email_tokens').get().count, 1)
})

test('session tokens are accepted before expiry and rejected at the expiry boundary', () => {
  const db = openDb(':memory:')
  const user = registerUser(db, 'session-user', 'longenough', 'session@example.com')
  const token = issueToken(db, user.userId, 60)
  const expiresAt = Date.parse(db.prepare('select expires_at from tokens where user_id=?').get(user.userId).expires_at)

  assert.equal(userFromAuth(db, `Bearer ${token}`, expiresAt - 1).userId, user.userId)
  assert.equal(userFromAuth(db, `Bearer ${token}`, expiresAt), null)
  assert.equal(db.prepare('select count(*) as count from tokens where user_id=?').get(user.userId).count, 0)
})

test('protected API routes reject expired bearer sessions', async () => {
  const db = openDb(':memory:')
  const user = registerUser(db, 'expired-user', 'longenough', 'expired@example.com')
  const token = issueToken(db, user.userId, 60)
  db.prepare('update tokens set expires_at=? where user_id=?')
    .run(new Date(Date.now() - 1).toISOString(), user.userId)
  const isolated = http.createServer(testApp({ db }))
  await new Promise((resolve) => isolated.listen(0, resolve))

  try {
    const response = await fetch(`http://127.0.0.1:${isolated.address().port}/api/me`, {
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(response.status, 401)
  } finally {
    await new Promise((resolve) => isolated.close(resolve))
  }
})

test('email verification API accepts the emailed OTP through the configured keyed verifier', async () => {
  const messages = []
  const isolated = http.createServer(testApp({
    db: openDb(':memory:'),
    mailer: { async send(message) { messages.push(message) } },
    appUrl: 'http://app.test',
  }))
  await new Promise((resolve) => isolated.listen(0, resolve))
  const origin = `http://127.0.0.1:${isolated.address().port}`

  try {
    const registration = await fetch(`${origin}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'otp-route', password: 'longenough', email: 'otp-route@example.com' }),
    })
    const session = await registration.json()
    assert.equal(registration.status, 200)
    const code = /verification code is: (\d{6})/.exec(messages[0].text)?.[1]
    assert.ok(code)

    const verified = await fetch(`${origin}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ code }),
    })
    assert.equal(verified.status, 200)
    assert.equal((await verified.json()).verified, true)
  } finally {
    await new Promise((resolve) => isolated.close(resolve))
  }
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
  const isolated = http.createServer(testApp({ db: openDb(':memory:'), emailProvider: failing, appUrl: 'https://app.test', authLimit: 1000 }))
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
  const isolated = http.createServer(testApp({ db: openDb(':memory:'), emailProvider: provider, appUrl: 'https://app.test', authLimit: 1000 }))
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

test('save validation rejects malformed version-1 states without changing the stored save or revision', async () => {
  const db = openDb(':memory:')
  const isolated = http.createServer(testApp({
    db,
    mailer: { async send() { return { provider: 'test', status: 'accepted' } } },
    appUrl: 'http://app.test',
    authLimit: 1000,
  }))
  await new Promise((resolve) => isolated.listen(0, resolve))
  const origin = `http://127.0.0.1:${isolated.address().port}`
  const isolatedCall = async (method, path, body, token) => {
    const res = await fetch(origin + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    })
    return { status: res.status, body: await res.json() }
  }

  try {
    const registration = await isolatedCall('POST', '/api/auth/register', {
      username: 'SaveCheck',
      password: 'longenough',
      email: 'savecheck@example.com',
    })
    assert.equal(registration.status, 200)
    const token = registration.body.token
    const baseline = createInitialState({ name: 'SaveCheck' })
    const seeded = await isolatedCall('PUT', '/api/save', { state: baseline, baseRevision: 0 }, token)
    assert.equal(seeded.status, 200)
    assert.equal(seeded.body.revision, 1)
    const userId = db.prepare('select id from users where username=?').get('savecheck').id
    const readStoredRow = () => db.prepare('select state, updated_at, revision, device_id from saves where user_id=?').get(userId)
    const originalRow = readStoredRow()
    const clone = () => structuredClone(baseline)
    const malformed = [
      ['null root', null],
      ['string progress', (() => { const state = clone(); state.progress = 'invalid'; return state })()],
      ['string settings', (() => { const state = clone(); state.settings = 'invalid'; return state })()],
      ['negative XP', (() => { const state = clone(); state.player.xp = -1; return state })()],
      ['NaN serialized as null', (() => { const state = clone(); state.player.xp = Number.NaN; return state })()],
      ['string XP', (() => { const state = clone(); state.player.xp = '10'; return state })()],
      ['unknown Gate ID', (() => {
        const state = clone()
        state.progress.gates['unknown-01'] = { ...state.progress.gates['beast-01'], gateId: 'unknown-01' }
        return state
      })()],
      ['invalid stage reference', (() => {
        const state = clone()
        state.progress.gates['beast-01'].days[99] = { completedAt: new Date().toISOString(), completedDate: '2026-03-01' }
        return state
      })()],
      ['malformed nested stage record', (() => {
        const state = clone()
        state.progress.gates['beast-01'].days[1] = { completedAt: 123, completedDate: '2026-03-01' }
        return state
      })()],
    ]

    for (const [label, state] of malformed) {
      const response = await isolatedCall('PUT', '/api/save', { state, baseRevision: 1, deviceId: label }, token)
      assert.equal(response.status, 400, label)
      assert.deepEqual(readStoredRow(), originalRow, `${label} changed stored data or revision`)
    }

    const valid = await isolatedCall('PUT', '/api/save', { state: baseline, baseRevision: 1 }, token)
    assert.equal(valid.status, 200)
    assert.equal(valid.body.revision, 2)
    assert.equal(readStoredRow().revision, 2)
  } finally {
    await new Promise((resolve) => isolated.close(resolve))
  }
})
