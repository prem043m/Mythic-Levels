import { describe, it, expect } from 'vitest'
import { createInitialState } from '@/services/progression/engine'
import { applySettings, isAvailableOn } from '@/services/settings/settings'

describe('applySettings', () => {
  const base = createInitialState({ name: 'T' })
  it('applies valid values without mutating the input', () => {
    const next = applySettings(base, { difficulty: 'austere', dailyDuration: '45', availableDays: ['sat', 'mon'], reminderTime: '07:30' })
    expect(next.settings).toMatchObject({ difficulty: 'austere', dailyDuration: 45, availableDays: ['mon', 'sat'], reminderTime: '07:30' })
    expect(base.settings.difficulty).toBe('standard')
  })
  it('ignores invalid values', () => {
    const next = applySettings(base, { difficulty: 'nightmare', dailyDuration: 5, availableDays: [], reminderTime: '25:99' })
    expect(next.settings.difficulty).toBe('standard')
    expect(next.settings.dailyDuration).toBe(25)
    expect(next.settings.availableDays).toHaveLength(7)
  })
  it('detects rest days', () => {
    const s = { availableDays: ['mon'] }
    expect(isAvailableOn(s, new Date(2026, 10, 9))).toBe(true) // Monday
    expect(isAvailableOn(s, new Date(2026, 10, 10))).toBe(false)
  })
})
