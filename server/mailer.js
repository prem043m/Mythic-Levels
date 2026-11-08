import net from 'node:net'
import tls from 'node:tls'
import { randomBytes } from 'node:crypto'

const clean = (s) => String(s).replace(/[\r\n]+/g, ' ').trim() // blocks header injection
const addr = (s) => /<([^>]+)>/.exec(s)?.[1] || clean(s)
const b64 = (s) => Buffer.from(s).toString('base64').replace(/.{76}(?=.)/g, '$&\r\n')

export function buildMessage({ from, to, subject, text, html }) {
  const sep = `ml_${randomBytes(8).toString('hex')}`
  const plain = clean(subject)
  const subj = /[^\x20-\x7e]/.test(plain) ? `=?UTF-8?B?${Buffer.from(plain).toString('base64')}?=` : plain
  return [
    `From: ${clean(from)}`, `To: ${clean(to)}`, `Subject: ${subj}`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${randomBytes(12).toString('hex')}@mythic-levels>`, 'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${sep}"`, '',
    `--${sep}`, 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '', b64(text),
    `--${sep}`, 'Content-Type: text/html; charset=utf-8', 'Content-Transfer-Encoding: base64', '', b64(html),
    `--${sep}--`, '',
  ].join('\r\n')
}

// Minimal SMTP client (implicit TLS on 465, STARTTLS when offered, AUTH PLAIN).
export function smtpSend(cfg, { from, to, message }) {
  return new Promise((resolve, reject) => {
    let sock = cfg.secure ? tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host }) : net.connect(cfg.port, cfg.host)
    let buf = ''
    let waiter = null
    let finished = false
    const end = (err) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      sock.destroy()
      err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve()
    }
    const timer = setTimeout(() => end(new Error('smtp-timeout')), 20_000)
    const check = () => {
      if (!waiter) return
      const lines = buf.split('\r\n')
      const done = lines.slice(0, -1)
      const i = done.findIndex((l) => /^\d{3}( |$)/.test(l))
      if (i < 0) return
      buf = lines.slice(i + 1).join('\r\n')
      const w = waiter; waiter = null
      w({ code: Number(done[0].slice(0, 3)), text: done.slice(0, i + 1).join('\n') })
    }
    const attach = (s) => {
      s.setEncoding('utf8')
      s.on('data', (d) => { buf += d; check() })
      s.on('error', end)
      s.on('close', () => end(new Error('smtp-closed')))
    }
    const read = () => new Promise((res) => { waiter = res; check() })
    const expect = (r, codes) => { if (!codes.includes(r.code)) throw new Error(`smtp ${r.code}: ${r.text.slice(0, 120)}`); return r }
    const cmd = async (line, codes) => { sock.write(`${line}\r\n`); return expect(await read(), codes) }
    attach(sock)
    ;(async () => {
      expect(await read(), [220])
      let r = await cmd(`EHLO ${cfg.helo || 'localhost'}`, [250])
      if (!cfg.secure && /STARTTLS/i.test(r.text)) {
        await cmd('STARTTLS', [220])
        const raw = sock
        raw.removeAllListeners('data'); raw.removeAllListeners('close'); raw.removeAllListeners('error')
        sock = tls.connect({ socket: raw, servername: cfg.host })
        attach(sock)
        await cmd(`EHLO ${cfg.helo || 'localhost'}`, [250])
      }
      if (cfg.user && !cfg.secure && !/STARTTLS/i.test(r.text)) throw new Error('smtp-tls-required')
      if (cfg.user) await cmd(`AUTH PLAIN ${Buffer.from(`\0${cfg.user}\0${cfg.pass}`).toString('base64')}`, [235])
      await cmd(`MAIL FROM:<${addr(from)}>`, [250])
      await cmd(`RCPT TO:<${addr(to)}>`, [250, 251])
      await cmd('DATA', [354])
      sock.write(`${message.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..')}\r\n.\r\n`)
      expect(await read(), [250])
      await cmd('QUIT', [221])
      end()
    })().catch(end)
  })
}

// Without SMTP_HOST, mail is printed to the server console (development).
export function createMailer(env = process.env) {
  const outbox = []
  const from = env.EMAIL_FROM || env.MAIL_FROM || 'Mythic Levels <no-reply@localhost>'
  if (!env.SMTP_HOST || env.NODE_ENV === 'development') {
    return { kind: 'console', outbox, async send(m) {
      outbox.push(m)
      console.log(`\n[mail:dev] provider=console status=accepted recipient=${m.to} subject=${m.subject}\n`)
    } }
  }
  const port = Number(env.SMTP_PORT) || 587
  const cfg = { host: env.SMTP_HOST, port, secure: env.SMTP_SECURE === 'true' || port === 465, user: env.SMTP_USER, pass: env.SMTP_PASS }
  return { kind: 'smtp', outbox, async send(m) { outbox.push(m); await smtpSend(cfg, { from, to: m.to, message: buildMessage({ from, ...m }) }) } }
}
