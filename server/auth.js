import { scryptSync, randomBytes, randomInt, timingSafeEqual, createHash } from 'node:crypto'

const sha = (s) => createHash('sha256').update(s).digest('hex')
const hashPw = (pw, salt) => scryptSync(pw, salt, 64)
const now = () => new Date().toISOString()

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase()
export const validEmail = (e) => e.length <= 254 && /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(e)
export const validPassword = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 200

const toUser = (row) => row && { userId: row.id, username: row.username, email: row.email, verifiedAt: row.email_verified_at }

export function registerUser(db, username, password, email) {
  const name = String(username || '').trim().toLowerCase()
  const mail = normalizeEmail(email)
  if (!/^[a-z0-9_.-]{3,32}$/.test(name)) return { error: 'bad-username' }
  if (!validEmail(mail)) return { error: 'bad-email' }
  if (!validPassword(password)) return { error: 'weak-password' }
  const salt = randomBytes(16).toString('hex')
  try {
    const r = db.prepare('insert into users(username,salt,hash,created_at,email) values(?,?,?,?,?)')
      .run(name, salt, hashPw(password, salt).toString('hex'), now(), mail)
    return { userId: Number(r.lastInsertRowid), username: name, email: mail, verifiedAt: null }
  } catch (e) {
    return { error: /email/.test(String(e.message)) ? 'email-taken' : 'username-taken' }
  }
}

export function verifyUser(db, login, password) {
  const id = String(login || '').trim().toLowerCase()
  const row = db.prepare('select * from users where username=? or email=?').get(id, id)
  const given = hashPw(String(password || ''), row?.salt || '00'.repeat(16))
  return row && timingSafeEqual(given, Buffer.from(row.hash, 'hex')) ? toUser(row) : { error: 'invalid-credentials' }
}

export const getUser = (db, userId) => toUser(db.prepare('select * from users where id=?').get(userId))
export const findByEmail = (db, email) => toUser(db.prepare('select * from users where email=?').get(normalizeEmail(email)))

export function setPassword(db, userId, password) {
  const salt = randomBytes(16).toString('hex')
  db.prepare('update users set salt=?, hash=? where id=?').run(salt, hashPw(password, salt).toString('hex'), userId)
  db.prepare('delete from tokens where user_id=?').run(userId) // sign out everywhere
}

export function setEmail(db, userId, email) {
  const mail = normalizeEmail(email)
  if (!validEmail(mail)) return { error: 'bad-email' }
  try {
    db.prepare('update users set email=?, email_verified_at=null where id=?').run(mail, userId)
    return { email: mail }
  } catch { return { error: 'email-taken' } }
}

export const markVerified = (db, userId) => db.prepare('update users set email_verified_at=? where id=?').run(now(), userId)

export function createVerificationChallenge(db, userId, ttlMs = 10 * 60e3) {
  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const raw = randomBytes(32).toString('hex')
  const sentAt = now()
  db.exec('begin immediate')
  try {
    db.prepare('delete from email_tokens where user_id=? and purpose=?').run(userId, 'verify')
    db.prepare('insert into email_tokens(hash,user_id,purpose,expires_at) values(?,?,?,?)')
      .run(sha(raw), userId, 'verify', new Date(Date.now() + 30 * 60e3).toISOString())
    db.prepare('insert into verification_codes(user_id,hash,expires_at,attempts,sent_at) values(?,?,?,?,?) on conflict(user_id) do update set hash=excluded.hash, expires_at=excluded.expires_at, attempts=0, sent_at=excluded.sent_at')
      .run(userId, sha(otp), new Date(Date.now() + ttlMs).toISOString(), 0, sentAt)
    db.exec('commit')
  } catch (error) {
    db.exec('rollback')
    throw error
  }
  return { otp, linkToken: raw, sentAt }
}

export function verificationResendAllowed(db, userId, cooldownMs = 60e3) {
  const row = db.prepare('select sent_at from verification_codes where user_id=?').get(userId)
  return !row || Date.now() - Date.parse(row.sent_at) >= cooldownMs
}

export function allowVerificationRetry(db, userId) {
  db.prepare('update verification_codes set sent_at=? where user_id=?').run(new Date(0).toISOString(), userId)
}

export function consumeVerificationCode(db, userId, code) {
  const normalized = String(code || '')
  if (!/^\d{6}$/.test(normalized)) return { error: 'invalid-code' }
  db.exec('begin immediate')
  try {
    const row = db.prepare('select hash, expires_at, attempts from verification_codes where user_id=?').get(userId)
    if (!row) { db.exec('rollback'); return { error: 'invalid-or-expired' } }
    if (new Date(row.expires_at) <= new Date()) {
      db.prepare('delete from verification_codes where user_id=?').run(userId)
      db.exec('commit')
      return { error: 'invalid-or-expired' }
    }
    if (row.attempts >= 5) { db.exec('rollback'); return { error: 'too-many-attempts' } }
    const matches = timingSafeEqual(Buffer.from(row.hash, 'hex'), Buffer.from(sha(normalized), 'hex'))
    if (!matches) {
      db.prepare('update verification_codes set attempts=attempts+1 where user_id=?').run(userId)
      db.exec('commit')
      return { error: row.attempts + 1 >= 5 ? 'too-many-attempts' : 'invalid-code' }
    }
    db.prepare('delete from verification_codes where user_id=?').run(userId)
    db.prepare('delete from email_tokens where user_id=? and purpose=?').run(userId, 'verify')
    markVerified(db, userId)
    db.exec('commit')
    return { ok: true, userId }
  } catch (error) {
    db.exec('rollback')
    throw error
  }
}

// One-time email tokens: only a hash is stored; a new token replaces older ones of the same purpose.
export function createEmailToken(db, userId, purpose, ttlMs) {
  const raw = randomBytes(32).toString('hex')
  db.prepare('delete from email_tokens where user_id=? and purpose=?').run(userId, purpose)
  db.prepare('insert into email_tokens(hash,user_id,purpose,expires_at) values(?,?,?,?)')
    .run(sha(raw), userId, purpose, new Date(Date.now() + ttlMs).toISOString())
  return raw
}
export function consumeEmailToken(db, raw, purpose) {
  const h = sha(String(raw || ''))
  db.exec('begin immediate')
  try {
    const row = db.prepare('select user_id, expires_at from email_tokens where hash=? and purpose=?').get(h, purpose)
    if (!row) { db.exec('rollback'); return null }
    db.prepare('delete from email_tokens where hash=? and purpose=?').run(h, purpose)
    db.exec('commit')
    return new Date(row.expires_at) > new Date() ? row.user_id : null
  } catch (error) {
    db.exec('rollback')
    throw error
  }
}

export function consumeEmailTokenForUser(db, raw, purpose, userId) {
  const h = sha(String(raw || ''))
  const row = db.prepare('select user_id, expires_at from email_tokens where hash=? and purpose=?').get(h, purpose)
  if (!row || row.user_id !== userId) return null
  db.prepare('delete from email_tokens where hash=? and user_id=? and purpose=?').run(h, userId, purpose)
  return new Date(row.expires_at) > new Date() ? row.user_id : null
}

export function consumeVerificationLink(db, raw) {
  const h = sha(String(raw || ''))
  db.exec('begin immediate')
  try {
    const row = db.prepare('select user_id, expires_at from email_tokens where hash=? and purpose=?').get(h, 'verify')
    if (!row || new Date(row.expires_at) <= new Date()) {
      db.exec('rollback')
      return null
    }
    db.prepare('delete from email_tokens where hash=? and purpose=?').run(h, 'verify')
    db.prepare('delete from verification_codes where user_id=?').run(row.user_id)
    markVerified(db, row.user_id)
    db.exec('commit')
    return row.user_id
  } catch (error) {
    db.exec('rollback')
    throw error
  }
}

export function issueToken(db, userId) {
  const token = randomBytes(32).toString('hex')
  db.prepare('insert into tokens(hash,user_id,created_at) values(?,?,?)').run(sha(token), userId, now())
  return token
}
const bearer = (header) => /^Bearer ([a-f0-9]{64})$/.exec(header || '')?.[1]
export function userFromAuth(db, header) {
  const t = bearer(header)
  if (!t) return null
  return toUser(db.prepare('select u.* from tokens t join users u on u.id=t.user_id where t.hash=?').get(sha(t)))
}
export function revoke(db, header) {
  const t = bearer(header)
  if (t) db.prepare('delete from tokens where hash=?').run(sha(t))
}
