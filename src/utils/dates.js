export function toDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(dateKey, amount) {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

export function daysBetween(fromKey, toKey) {
  const from = parseDateKey(fromKey)
  const to = parseDateKey(toKey)
  return Math.round((to - from) / 86400000)
}

export function todayKey() {
  return toDateKey(new Date())
}
