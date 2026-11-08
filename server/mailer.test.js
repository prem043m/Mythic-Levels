import { test } from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import { smtpSend, buildMessage } from './mailer.js'
import { verifyEmail } from './emailTemplates.js'

test('SMTP client delivers a MIME message (dot-stuffing, header-injection safe)', async () => {
  let data = ''
  const rcpt = []
  const srv = net.createServer((s) => {
    let inData = false
    let buf = ''
    s.write('220 fake ready\r\n')
    s.on('data', (d) => {
      buf += d
      if (inData) {
        if (buf.endsWith('\r\n.\r\n')) { data = buf; inData = false; buf = ''; s.write('250 queued\r\n') }
        return
      }
      for (const line of buf.split('\r\n').slice(0, -1)) {
        if (/^EHLO/.test(line)) s.write('250-fake\r\n250 8BITMIME\r\n')
        else if (/^MAIL/.test(line)) s.write('250 ok\r\n')
        else if (/^RCPT/.test(line)) { rcpt.push(line); s.write('250 ok\r\n') }
        else if (/^DATA/.test(line)) { inData = true; s.write('354 go\r\n') }
        else if (/^QUIT/.test(line)) s.end('221 bye\r\n')
      }
      if (!inData) buf = ''
    })
  })
  await new Promise((r) => srv.listen(0, '127.0.0.1', r))
  const m = verifyEmail({ name: 'Ana', link: 'http://app.test/#/verify?token=abc' })
  const message = buildMessage({ from: 'Mythic <no-reply@x.test>', to: 'ana@example.com', ...m, subject: 'Hi\r\nBcc: evil@x.test' })
  await smtpSend({ host: '127.0.0.1', port: srv.address().port, secure: false }, { from: 'Mythic <no-reply@x.test>', to: 'ana@example.com', message })
  srv.close()
  assert.deepEqual(rcpt, ['RCPT TO:<ana@example.com>'])
  assert.match(data, /Subject: Hi Bcc: evil@x.test/)
  assert.ok(!/^Bcc:/m.test(data))
  assert.ok(Buffer.from(/text\/plain[\s\S]*?\r\n\r\n([\s\S]*?)\r\n--/.exec(data)[1], 'base64').toString().includes('http://app.test/#/verify?token=abc'))
})
