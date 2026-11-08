const SCRIPT = /<\s*script/gi

export function sanitizePlainText(value) {
  if (typeof value !== 'string') return ''
  return value.replace(SCRIPT, '').slice(0, 8000)
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
