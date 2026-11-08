import { addDays, daysBetween, parseDateKey } from '@/utils/dates'

const NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const ALL = NAMES

// A streak counts PRACTICE days only. Skipping a rest day never breaks it; skipping a practice day does
// (the player “returns”: progress is kept, only the run restarts). Dates are local calendar keys, so DST and
// timezone offsets cannot create or remove a day.
export function applyStreak(streak, dateKey, availableDays = ALL) {
  const next = { ...streak, interrupted: false }
  if (!streak.lastActiveDate) {
    return { streak: { ...next, current: 1, longest: Math.max(1, streak.longest), lastActiveDate: dateKey }, kind: 'started' }
  }
  const gap = daysBetween(streak.lastActiveDate, dateKey)
  if (gap <= 0) return { streak: next, kind: 'same-day' } // same day, or a clock that moved backwards
  let missed = false
  for (let i = 1; i < gap && !missed; i += 1) {
    missed = availableDays.includes(NAMES[parseDateKey(addDays(streak.lastActiveDate, i)).getDay()])
  }
  if (!missed) {
    next.current = streak.current + 1
    next.longest = Math.max(next.current, streak.longest)
    next.lastActiveDate = dateKey
    return { streak: next, kind: 'continued' }
  }
  next.current = 1
  next.lastActiveDate = dateKey
  next.interrupted = true
  return { streak: next, kind: 'returned' }
}
