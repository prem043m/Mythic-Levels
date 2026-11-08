import { DIFFICULTY } from '@/config/constants'

export const DAY_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

/** Pure: returns a new state with validated settings changes applied. Invalid values are ignored. */
export function applySettings(state, patch) {
  const s = { ...state.settings }
  if (Object.prototype.hasOwnProperty.call(DIFFICULTY, patch.difficulty)) s.difficulty = patch.difficulty
  if (patch.dailyDuration !== undefined) {
    const n = Math.round(Number(patch.dailyDuration))
    if (n >= 10 && n <= 120) s.dailyDuration = n
  }
  if (Array.isArray(patch.availableDays)) {
    const days = DAY_IDS.filter((d) => patch.availableDays.includes(d))
    if (days.length) s.availableDays = days
  }
  if (patch.reminders !== undefined) s.reminders = Boolean(patch.reminders)
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(patch.reminderTime || '')) s.reminderTime = patch.reminderTime
  if (patch.soundEnabled !== undefined) s.soundEnabled = Boolean(patch.soundEnabled)
  return { ...state, settings: s }
}

export function isAvailableOn(settings, date = new Date()) {
  return settings.availableDays.includes(DAY_IDS[(date.getDay() + 6) % 7])
}
