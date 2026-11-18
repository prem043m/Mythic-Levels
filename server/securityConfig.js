export const DEFAULT_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60

export function resolveSessionTtlSeconds(value = process.env.SESSION_TTL_SECONDS) {
  const parsed = value === undefined
    ? DEFAULT_SESSION_TTL_SECONDS
    : typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value)
        ? Number(value)
        : NaN
  const expiresAt = Date.now() + parsed * 1000
  if (!Number.isSafeInteger(parsed) || parsed <= 0 || !Number.isFinite(expiresAt) || expiresAt > 8.64e15) {
    throw new Error('SESSION_TTL_SECONDS must be a positive whole number that can be represented as a date')
  }
  return parsed
}

export function requireOtpVerifierSecret(secret = process.env.OTP_VERIFIER_SECRET) {
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('OTP_VERIFIER_SECRET must contain at least 32 bytes')
  }
  return secret
}
