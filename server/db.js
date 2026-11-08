import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

export function openDb(file = process.env.MYTHIC_DB || 'server/data/mythic.db') {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    create table if not exists users(id integer primary key, username text unique not null, salt text not null, hash text not null, created_at text not null, email text, email_verified_at text);
    create table if not exists tokens(hash text primary key, user_id integer not null, created_at text not null);
    create table if not exists saves(user_id integer primary key, state text not null, updated_at text not null, revision integer not null default 1, device_id text);
    create table if not exists email_tokens(hash text primary key, user_id integer not null, purpose text not null, expires_at text not null);
    create table if not exists verification_codes(user_id integer primary key, hash text not null, expires_at text not null, attempts integer not null default 0, sent_at text not null);
  `)
  // Migrate databases created before email support.
  const cols = db.prepare('pragma table_info(users)').all().map((c) => c.name)
  if (!cols.includes('email')) db.exec('alter table users add column email text')
  if (!cols.includes('email_verified_at')) db.exec('alter table users add column email_verified_at text')
  const saveCols = db.prepare('pragma table_info(saves)').all().map((c) => c.name)
  if (!saveCols.includes('revision')) db.exec('alter table saves add column revision integer not null default 1')
  if (!saveCols.includes('device_id')) db.exec('alter table saves add column device_id text')
  db.exec('create unique index if not exists users_email on users(email)')
  return db
}
