export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function percent(value, digits = 0) {
  return `${Math.round(value * 100 * 10 ** digits) / 10 ** digits}%`
}
