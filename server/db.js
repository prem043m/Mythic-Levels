import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { resolveSessionTtlSeconds } from './securityConfig.js'

export function migrateDb(db, sessionTtlSeconds = resolveSessionTtlSeconds()) {
  const ttlSeconds = resolveSessionTtlSeconds(sessionTtlSeconds)
  db.exec(`
    create table if not exists users(id integer primary key, username text unique not null, salt text not null, hash text not null, created_at text not null, email text, email_verified_at text);
    create table if not exists tokens(hash text primary key, user_id integer not null, created_at text not null, expires_at text not null);
    create table if not exists saves(user_id integer primary key, state text not null, updated_at text not null, revision integer not null default 1, device_id text);
    create table if not exists email_tokens(hash text primary key, user_id integer not null, purpose text not null, expires_at text not null);
    create table if not exists verification_codes(user_id integer primary key, hash text not null, expires_at text not null, attempts integer not null default 0, sent_at text not null, verifier_version integer not null default 1);
  `)
  // Apply additive migrations for existing accounts, sessions, saves, and OTP challenges.
  const cols = db.prepare('pragma table_info(users)').all().map((c) => c.name)
  if (!cols.includes('email')) db.exec('alter table users add column email text')
  if (!cols.includes('email_verified_at')) db.exec('alter table users add column email_verified_at text')
  const tokenCols = db.prepare('pragma table_info(tokens)').all().map((c) => c.name)
  if (!tokenCols.includes('expires_at')) db.exec('alter table tokens add column expires_at text')
  const ttlMs = ttlSeconds * 1000
  const migrationNow = Date.now()
  const tokenRows = db.prepare('select hash, created_at from tokens where expires_at is null').all()
  const updateTokenExpiry = db.prepare('update tokens set expires_at=? where hash=?')
  const deleteToken = db.prepare('delete from tokens where hash=?')
  for (const row of tokenRows) {
    const createdAt = Date.parse(row.created_at)
    if (!Number.isFinite(createdAt)) {
      deleteToken.run(row.hash)
      continue
    }
    const expiresAt = Math.min(createdAt + ttlMs, migrationNow + ttlMs)
    if (!Number.isFinite(expiresAt) || expiresAt > 8.64e15 || expiresAt < -8.64e15) {
      deleteToken.run(row.hash)
      continue
    }
    updateTokenExpiry.run(new Date(expiresAt).toISOString(), row.hash)
  }
  const verificationCols = db.prepare('pragma table_info(verification_codes)').all().map((c) => c.name)
  if (!verificationCols.includes('verifier_version')) db.exec('alter table verification_codes add column verifier_version integer')
  db.prepare('delete from verification_codes where verifier_version is null').run()
  const saveCols = db.prepare('pragma table_info(saves)').all().map((c) => c.name)
  if (!saveCols.includes('revision')) db.exec('alter table saves add column revision integer not null default 1')
  if (!saveCols.includes('device_id')) db.exec('alter table saves add column device_id text')
  db.exec('create unique index if not exists users_email on users(email)')
  return db
}

export function openDb(file = process.env.MYTHIC_DB || 'server/data/mythic.db', sessionTtlSeconds = resolveSessionTtlSeconds()) {
  const ttlSeconds = resolveSessionTtlSeconds(sessionTtlSeconds)
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true })
  return migrateDb(new DatabaseSync(file), ttlSeconds)
}
