const AUTH_KEY = 'mythic-levels:auth'

export function getAuth() {
  try { return JSON.parse(window.localStorage.getItem(AUTH_KEY)) } catch { return null }
}
export function getDeviceId() {
  try {
    let id = window.localStorage.getItem('mythic-levels:device')
    if (!id) { id = crypto.randomUUID(); window.localStorage.setItem('mythic-levels:device', id) }
    return id
  } catch { return 'unknown' }
}
export function setAuth(auth) {
  try { auth ? window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth)) : window.localStorage.removeItem(AUTH_KEY) } catch { /* ignore */ }
}

async function request(method, path, body) {
  const auth = getAuth()
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(auth && { authorization: `Bearer ${auth.token}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: 'offline' }
  }
  const data = await res.json().catch(() => ({}))
  return res.ok ? { ok: true, ...data } : { ...data, ok: false, status: res.status, error: data.error || 'error' }
}

export const api = {
  auth: (mode, username, password, email) => request('POST', `/auth/${mode}`, { username, password, email }),
  me: () => request('GET', '/me'),
  verify: (token) => request('POST', '/auth/verify', { token }),
  verifyOtp: (code) => request('POST', '/auth/verify-otp', { code }),
  resend: () => request('POST', '/auth/resend', {}),
  setEmail: (email) => request('POST', '/auth/email', { email }),
  forgot: (email) => request('POST', '/auth/forgot', { email }),
  reset: (token, password) => request('POST', '/auth/reset', { token, password }),
  logout: () => request('POST', '/auth/logout', {}),
  getSave: () => request('GET', '/save'),
  putSave: (state, baseRevision, force = false) => request('PUT', '/save', { state, baseRevision, force, deviceId: getDeviceId() }),
  coach: (question, gateId) => request('POST', '/coach', { question, gateId }),
}

export const ERROR_TEXT = {
  offline: 'Backend not reachable. Start it with "npm run server".',
  unauthorized: 'Your session expired. Please sign in again.',
  'invalid-credentials': 'Wrong username or password.',
  'username-taken': 'That username is taken.',
  'bad-username': 'Username must be 3–32 letters, numbers, . _ or -.',
  'weak-password': 'Password must be at least 8 characters.',
  'too-many-attempts': 'Too many attempts. Try again in a few minutes.',
  'bad-email': 'Please enter a valid email address.',
  'email-taken': 'That email is already registered.',
  'email-delivery-failed': 'We could not send the email right now. Please try again shortly.',
  'invalid-code': 'That verification code is incorrect.',
  'resend-cooldown': 'Please wait before requesting another verification email.',
  'invalid-or-expired': 'This link is invalid or has expired. Request a new one.',
  'email-not-verified': 'Verify your email first (check your inbox, or resend from Settings → Account).',
  conflict: 'Another device saved newer progress. Choose which copy to keep.',
  'invalid-state': 'The server rejected this save as invalid.',
}
