import { describe, it, expect } from 'vitest'
import { completeQuest, createInitialState, getGateMastery } from '@/services/progression/engine'
import { getGateById } from '@/data/catalog'
import { STAGE_TEXT } from './helpers'

describe('quest completion', () => {
  const gate = getGateById('beast-01')
  const first = { gateId: gate.id, questId: gate.days[0].id, reflection: STAGE_TEXT[0], dateKey: '2026-03-01' }
  it('does not award a quest twice after a reworded retry', () => {
    const s = createInitialState({ name: 'Test' })
    const a = completeQuest(s, first)
    expect(a.ok).toBe(true)
    expect(a.state.player.xp).toBeGreaterThan(0)
    const completed = a.state.progress.gates[gate.id].days[1]
    const beforeRetry = {
      xp: a.state.player.xp,
      resources: [a.state.player.mp, a.state.player.sp, a.state.player.ap, a.state.player.dp, a.state.player.kp, a.state.player.cp],
      attributes: { ...a.state.player.attributes },
      completedStage: { ...completed },
      mastery: getGateMastery(a.state, gate.id).mastery,
      gateCompletedAt: a.state.progress.gates[gate.id].completedAt,
      nextGateUnlocked: Boolean(a.state.progress.gates['beast-02']?.unlocked),
    }
    const retry = completeQuest(a.state, {
      ...first,
      reflection: `${first.reflection} I wrote one additional note.`,
    })

    expect(retry.error).toBe('already-complete')
    expect(retry.state.player.xp).toBe(beforeRetry.xp)
    expect([retry.state.player.mp, retry.state.player.sp, retry.state.player.ap, retry.state.player.dp, retry.state.player.kp, retry.state.player.cp]).toEqual(beforeRetry.resources)
    expect(retry.state.player.attributes).toEqual(beforeRetry.attributes)
    expect(retry.state.progress.gates[gate.id].days[1]).toEqual(beforeRetry.completedStage)
    expect(getGateMastery(retry.state, gate.id).mastery).toBe(beforeRetry.mastery)
    expect(retry.state.progress.gates[gate.id].completedAt).toBe(beforeRetry.gateCompletedAt)
    expect(Boolean(retry.state.progress.gates['beast-02']?.unlocked)).toBe(beforeRetry.nextGateUnlocked)
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
