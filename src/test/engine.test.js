import { describe, it, expect } from 'vitest'
import { completeQuest, createInitialState } from '@/services/progression/engine'
import { getGateById } from '@/data/catalog'
import { STAGE_TEXT } from './helpers'

describe('quest completion', () => {
  const gate = getGateById('beast-01')
  const first = { gateId: gate.id, questId: gate.days[0].id, reflection: STAGE_TEXT[0], dateKey: '2026-03-01' }
  it('awards a quest once only', () => {
    const s = createInitialState({ name: 'Test' })
    const a = completeQuest(s, first)
    expect(a.ok).toBe(true)
    expect(a.state.player.xp).toBeGreaterThan(0)
    expect(completeQuest(a.state, first).ok).toBe(false)
  })
  it('does not mutate the input state', () => {
    const s = createInitialState({ name: 'Test' })
    completeQuest(s, first)
    expect(s.player.xp).toBe(0)
  })
  it('stores structured evidence with the stage', () => {
    const a = completeQuest(createInitialState({ name: 'Test' }), first)
    expect(a.state.progress.gates[gate.id].days[1].evidence.status).toBe('accepted')
  })
})
