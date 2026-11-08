const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const layout = (title, intro, link, label, outro) => `
<div style="background:#05050a;padding:32px 12px;font-family:Georgia,serif;color:#e8e4d9">
  <div style="max-width:520px;margin:auto;background:#0d0b14;border:1px solid #8a7344;border-radius:12px;padding:28px">
    <p style="color:#c8a96b;letter-spacing:.22em;text-transform:uppercase;font-size:13px;margin:0 0 18px">&#10022; Mythic Levels</p>
    <h1 style="font-size:22px;margin:0 0 12px;color:#e8e4d9">${esc(title)}</h1>
    <p style="line-height:1.6;color:#cfc9bb">${esc(intro)}</p>
    ${link ? `<p style="margin:24px 0"><a href="${esc(link)}" style="background:#c8a96b;color:#05050a;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;display:inline-block">${esc(label)}</a></p>
    <p style="font-size:12px;color:#9a9488;word-break:break-all">Or paste this link: ${esc(link)}</p>` : ''}
    <p style="font-size:13px;color:#9a9488;line-height:1.5">${esc(outro)}</p>
  </div>
</div>`

export const verifyEmail = ({ name, link, otp }) => ({
  subject: 'Confirm your email — Mythic Levels',
  text: `Welcome, ${name}.\n\nYour verification code is: ${otp}\nIt expires in 10 minutes.\n\nOr confirm your email here:\n${link}\n\nThe link expires in 30 minutes. If you did not create this account, ignore this message.`,
  html: layout(`Welcome, ${name}`, `Your verification code is ${otp}. It expires in 10 minutes. You can also use the confirmation link below.`, link, 'Confirm email', 'The link expires in 30 minutes. If you did not create this account, you can ignore this message.'),
})

export const resetEmail = ({ name, link }) => ({
  subject: 'Reset your password — Mythic Levels',
  text: `Hello ${name},\n\nReset your password:\n${link}\n\nThe link expires in 1 hour and works once. If you did not ask for this, ignore it; your password is unchanged.`,
  html: layout('Reset your password', `Hello ${name}. Use the button below to choose a new password.`, link, 'Choose a new password', 'The link expires in 1 hour and works once. If you did not request this, ignore it; your password is unchanged.'),
})

export const passwordChangedEmail = ({ name }) => ({
  subject: 'Your password was changed — Mythic Levels',
  text: `Hello ${name},\n\nYour password was just changed and all devices were signed out. If this was not you, reset your password right away.`,
  html: layout('Your password was changed', `Hello ${name}. Your password was just changed and all devices were signed out.`, null, '', 'If this was not you, reset your password right away.'),
})
