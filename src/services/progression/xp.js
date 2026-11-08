export function levelFromXp(xp) {
  let remaining = Math.max(0, xp)
  let level = 1
  let need = 200
  while (remaining >= need) {
    remaining -= need
    level += 1
    need = Math.round(need * 1.12)
  }
  return { level, intoLevel: remaining, toNext: need }
}

export function scaleXp(base, difficulty = 'standard') {
  const mul = difficulty === 'austere' ? 1.15 : difficulty === 'gentle' ? 0.9 : 1
  return Math.round(base * mul)
}
