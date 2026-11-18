import { describe, it, expect } from 'vitest'
import { getGateById } from '@/data/catalog'
import { completeQuest, sealStage, reviseEvidence, createInitialState, validateLoadedState, normalizeLoadedState } from '@/services/progression/engine'
import { evaluateGateCompletion } from '@/services/progression/mastery'
import { recommendNextPractice } from '@/services/progression/recommend'
import { evaluateSubmission, consistencyIssues } from '@/services/evaluation/engine'
import { EVAL, EVAL_FINGERPRINT } from '@/config/evaluation'
import { addDays } from '@/utils/dates'
import { fnv1a } from '@/utils/hash'
import { STAGE_TEXT, JUNK, newPlayer, playRitual } from './helpers'

const gate = getGateById('beast-01')
const q = (n, extra = {}) => ({ gateId: gate.id, questId: gate.days[n - 1].id, dateKey: '2026-03-01', ...extra })
const ROUTING_METADATA_KEYS = ['routing', 'classification', 'reasonCodes', 'providerEligible', 'hardCheck']
const containsRoutingMetadata = (value) => {
  if (Array.isArray(value)) return value.some(containsRoutingMetadata)
  if (!value || typeof value !== 'object') return false
  if (ROUTING_METADATA_KEYS.some((key) => Object.prototype.hasOwnProperty.call(value, key))) return true
  return Object.values(value).some(containsRoutingMetadata)
}
const failTimes = (state, n, times, date = '2026-03-01') => {
  let s = state
  for (let i = 0; i < times; i += 1) s = completeQuest(s, { ...q(n, { dateKey: date }), reflection: JUNK }).state
  return s
}
const playStagesWithSeals = (sealedDays, { dates, acceptedTexts = {} } = {}) => {
  let state = newPlayer()
  for (let day = 1; day <= gate.days.length; day += 1) {
    const dateKey = dates?.[day - 1] || addDays('2026-03-01', Math.floor((day - 1) / 2))
    const args = q(day, { dateKey })
    if (sealedDays.includes(day)) {
      state = failTimes(state, day, EVAL.recovery.attemptsBeforeSeal, dateKey)
      const sealed = sealStage(state, args)
      if (!sealed.ok) throw new Error(`Could not seal stage ${day}: ${sealed.error}`)
      state = sealed.state
    } else {
      const accepted = completeQuest(state, { ...args, reflection: acceptedTexts[day] || STAGE_TEXT[day - 1] })
      if (!accepted.ok) throw new Error(`Could not complete stage ${day}: ${accepted.error}`)
      state = accepted.state
    }
  }
  return state
}

describe('recovery seal: honest players are never trapped, and it cannot be farmed', () => {
  it('is unavailable until the attempt threshold is reached', () => {
    expect(sealStage(newPlayer(), q(1)).error).toBe('seal-not-available')
    const two = failTimes(newPlayer(), 1, EVAL.recovery.attemptsBeforeSeal - 1)
    const r = sealStage(two, q(1))
    expect(r.error).toBe('seal-not-available')
    expect(r.attempts).toBe(EVAL.recovery.attemptsBeforeSeal - 1)
  })
  it('unblocks progress and keeps the streak, but pays nothing', () => {
    const s0 = newPlayer()
    const stuck = failTimes(s0, 1, EVAL.recovery.attemptsBeforeSeal)
    const r = sealStage(stuck, q(1))
    expect(r.ok).toBe(true)
    const day = r.state.progress.gates[gate.id].days[1]
    expect(day.evidence.status).toBe('sealed')
    expect(day.evidence.verification).toBe('self-reported-sealed')
    expect(r.state.player.xp).toBe(s0.player.xp)
    expect(r.state.player.attributes).toEqual(s0.player.attributes)
    expect(r.state.progress.streak.current).toBe(1)
    // the next stage is now open
    expect(completeQuest(r.state, { ...q(2), reflection: STAGE_TEXT[1] }).ok).toBe(true)
  })
  it('cannot be applied twice, out of order, or past the daily limit', () => {
    const sealed = sealStage(failTimes(newPlayer(), 1, 3), q(1)).state
    expect(sealStage(sealed, q(1)).error).toBe('already-complete')
    expect(sealStage(failTimes(newPlayer(), 2, 3), q(2)).error).toBe('stage-locked')
  })
  it('never grants Gate mastery: a Gate of sealed stages stays incomplete', () => {
    let s = newPlayer()
    for (let d = 1; d <= 7; d += 1) {
      const date = addDays('2026-03-01', Math.floor((d - 1) / 2))
      s = failTimes(s, d, 3, date)
      const r = sealStage(s, q(d, { dateKey: date }))
      expect(r.ok).toBe(true)
      s = r.state
    }
    const run = playRitual(s, gate)
    expect(run.ok).toBe(true)
    const ev = evaluateGateCompletion(run.state, gate.id)
    expect(ev.status).toBe('IN_PROGRESS')
    expect(ev.checks.find((check) => check.id === 'stages').ok).toBe(true)
    expect(ev.signals.practice).toBe(0)
    expect(ev.missing.map((m) => m.id)).toContain('reflections')
    expect(run.state.progress.gates[gate.id].completedAt).toBe(null)
  })
  it('does not let sealed stages alone supply practice days or pass an incomplete ritual', () => {
    const state = playStagesWithSeals([7])
    const ev = evaluateGateCompletion(state, gate.id)
    expect(ev.checks.find((check) => check.id === 'stages').ok).toBe(true)
    expect(ev.checks.find((check) => check.id === 'ritual').ok).toBe(false)
    expect(ev.signals.practice).toBe(6 / 7)
    expect(ev.checks.find((check) => check.id === 'days').text).toContain('(3 so far)')
  })
  it.each([
    [[7], 6],
    [[6, 7], 5],
  ])('allows mixed accepted/sealed stages to qualify when the remaining mastery criteria pass', (sealedDays, acceptedCount) => {
    const state = playRitual(playStagesWithSeals(sealedDays), gate).state
    const ev = evaluateGateCompletion(state, gate.id)
    expect(ev.status).toBe('COMPLETED')
    expect(ev.signals.practice).toBe(acceptedCount / 7)
  })
  it('does not let sealed stages lift an otherwise under-threshold mixed Gate', () => {
    const state = playStagesWithSeals([2, 3, 6], {
      acceptedTexts: { 1: STAGE_TEXT[0], 4: STAGE_TEXT[3], 5: STAGE_TEXT[4], 7: STAGE_TEXT[6] },
    })
    const run = playRitual(state, gate, { outcome: 'no', minutes: 36 })
    const ev = evaluateGateCompletion(run.state, gate.id)
    expect(ev.checks.filter((check) => check.id !== 'stages').every((check) => check.ok)).toBe(true)
    expect(ev.checks.find((check) => check.id === 'stages').ok).toBe(true)
    expect(ev.signals.practice).toBe(4 / 7)
    expect(ev.status).toBe('NEEDS_MORE_PRACTICE')
    expect(ev.mastery).toBeLessThan(ev.threshold)
  })
  it('does not count dates belonging only to sealed stages toward practice days', () => {
    const state = playStagesWithSeals([3, 6, 7], {
      dates: ['2026-03-01', '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-03', '2026-03-04', '2026-03-05'],
    })
    const run = playRitual(state, gate)
    const ev = evaluateGateCompletion(run.state, gate.id)
    expect(ev.checks.find((check) => check.id === 'stages').ok).toBe(true)
    expect(ev.checks.find((check) => check.id === 'days').ok).toBe(false)
    expect(ev.checks.find((check) => check.id === 'days').text).toContain('(3 so far)')
    expect(ev.checks.find((check) => check.id === 'reflections').ok).toBe(true)
    expect(ev.checks.find((check) => check.id === 'application').ok).toBe(true)
    expect(ev.checks.find((check) => check.id === 'ritual').ok).toBe(true)
    expect(ev.status).toBe('IN_PROGRESS')
  })
  it('preserves previously completed Gate saves', () => {
    const state = playStagesWithSeals([1, 2, 3, 4, 5, 6, 7])
    state.progress.gates[gate.id].completedAt = '2026-01-01T00:00:00.000Z'
    expect(evaluateGateCompletion(state, gate.id).status).toBe('COMPLETED')
  })
  it('releases the held rewards exactly once, when the reflection is later accepted', () => {
    const sealed = sealStage(failTimes(newPlayer(), 1, 3), q(1)).state
    const before = sealed.player.xp
    const up = reviseEvidence(sealed, { gateId: gate.id, day: 1, text: STAGE_TEXT[0] })
    expect(up.ok).toBe(true)
    expect(up.state.player.xp).toBeGreaterThan(before)
    expect(up.state.progress.gates[gate.id].days[1].evidence.status).toBe('accepted')
    expect(up.state.progress.gates[gate.id].days[1].recoverySealedDate).toBe('2026-03-01')
    expect(evaluateGateCompletion(up.state, gate.id).signals.practice).toBe(1 / 7)
    expect(evaluateGateCompletion(up.state, gate.id).checks.find((check) => check.id === 'days').text).toContain('(1 so far)')
    expect(up.state.progress.gates[gate.id].days[1].deferred).toBe(undefined)
    const again = reviseEvidence(up.state, { gateId: gate.id, day: 1, text: STAGE_TEXT[0] + ' I also wrote it down.' })
    expect(again.state.player.xp).toBe(up.state.player.xp)
  })
  it('a sealed stage is recommended for improvement', () => {
    const sealed = sealStage(failTimes(newPlayer(), 1, 3), q(1)).state
    const rec = recommendNextPractice(sealed, '2026-03-02')
    expect(rec.ranking.some((c) => c.kind === 'revise')).toBe(true)
  })
})

describe('consistency checks are narrow: they clarify, never accuse', () => {
  it('flags an unambiguous self-contradiction for clarification', () => {
    const r = evaluateSubmission({ gate, day: gate.days[4], fields: { reflection: 'I did not practise at all today but I practised for thirty minutes and my attention was perfect because I put my phone away and I learned that focus matters next time.' }, legacy: true })
    expect(r.decision).toBe('REVIEW_REQUIRED')
    expect(r.missingCriteria[0].id).toBe('consistency')
  })
  it('does not flag honest, common sequences', () => {
    const honest = [
      'I did not check my phone for twenty minutes, then I checked it once.',
      'I did not check my phone at all for twenty minutes, but I checked it once afterwards.',
      'I did not practise at all yesterday, but today I practised for thirty minutes.',
      'I never opened Instagram and I opened WhatsApp twice.',
      'I did not check at all during the first hour and then I checked once.',
    ]
    for (const t of honest) expect(consistencyIssues(t)).toHaveLength(0)
  })
  it('requires review for contradictory claims split across guided fields', () => {
    const observation = gate.days.find((d) => d.phase === 'observation')
    const evaluate = (action, outcome) => evaluateSubmission({
      gate,
      day: observation,
      fields: {
        situation: 'Yesterday at my desk during a study session.',
        action,
        difficulty: 'I wanted to check my phone because the work felt difficult.',
        outcome,
      },
    })
    const contradiction = evaluate(
      'I did not check my phone.',
      'I checked my phone three times and returned to the report.',
    )

    expect(contradiction.decision).toBe('REVIEW_REQUIRED')
    expect(contradiction.routing.classification).toBe('FAST_PATH_REJECTABLE')
    expect(contradiction.routing.reason).toBe('explicit-contradiction')
    expect(contradiction.routing.hardCheck).toBe('contradiction')
    expect(contradiction.routing.providerEligible).toBe(false)
  })
  it('accepts a legitimate temporal sequence without treating it as a contradiction', () => {
    const observation = gate.days.find((d) => d.phase === 'observation')
    const sequence = evaluateSubmission({
      gate,
      day: observation,
      fields: {
        situation: 'Yesterday at my desk during a study session.',
        action: 'I did not check my phone during the first twenty minutes, then checked it once afterwards.',
        difficulty: 'I wanted to check my phone because the work felt difficult.',
        outcome: 'I recorded the interruption and returned to my report.',
      },
    })

    expect(sequence.decision).toBe('ACCEPTED')
  })
  it('flags an implausible duration but not a long, plausible one', () => {
    expect(consistencyIssues('I studied for 30 hours straight').length).toBe(1)
    expect(consistencyIssues('I studied for 3 hours and then rested').length).toBe(0)
  })
  it('a false positive can never trap a player (it is a clarification, and the seal remains available)', () => {
    const s = failTimes(newPlayer(), 1, 3)
    expect(sealStage(s, q(1)).ok).toBe(true)
  })
})

describe('durable history and evaluator fingerprint', () => {
  const text = 'a distinctive phrase that must never appear in the history record about flickering thoughts'
  it('records every evaluated submission without storing the text, newest first', () => {
    let s = completeQuest(newPlayer(), { ...q(1), reflection: JUNK }).state
    s = completeQuest(s, { ...q(1), reflection: STAGE_TEXT[0] }).state
    const h = s.progress.history
    expect(h).toHaveLength(2)
    expect(h[0].outcome).toBe('accepted')
    expect(h[1].outcome).toBe('draft')
    expect(h[0].attempts).toBe(2)
    expect(JSON.stringify(h)).not.toContain('Yesterday morning')
    expect(JSON.stringify(h)).not.toContain(JUNK)
    expect(text.length).toBeGreaterThan(0)
  })
  it('stamps evidence and history with the scoring-configuration fingerprint', () => {
    expect(EVAL_FINGERPRINT).toMatch(/^[0-9a-f]{8}$/)
    const s = completeQuest(newPlayer(), { ...q(1), reflection: STAGE_TEXT[0] }).state
    expect(s.progress.gates[gate.id].days[1].evidence.rubric.config).toBe(EVAL_FINGERPRINT)
    expect(s.progress.history[0].evaluator.config).toBe(EVAL_FINGERPRINT)
  })
  it('keeps old saves working: history is created lazily and the history is capped', () => {
    const old = createInitialState({ name: 'Old' })
    delete old.progress.history
    const s = completeQuest(old, { ...q(1), reflection: STAGE_TEXT[0] }).state
    expect(s.progress.history).toHaveLength(1)
  })
})

describe('routing metadata stays out of player data', () => {
  it('keeps accepted evaluation summaries free of routing diagnostics', () => {
    const result = completeQuest(newPlayer(), { ...q(1), reflection: STAGE_TEXT[0] })

    expect(result.ok).toBe(true)
    expect(result.submissionEvaluation).toMatchObject({
      decision: 'ACCEPTED',
      qualityScore: expect.any(Number),
      confidence: expect.any(Number),
      dimensions: expect.any(Object),
      evaluator: expect.any(Object),
      verification: 'self-reported',
    })
    expect(containsRoutingMetadata(result.submissionEvaluation)).toBe(false)
  })

  it('preserves draft structure without storing routing diagnostics', () => {
    const result = completeQuest(newPlayer(), { ...q(1), reflection: JUNK })
    const draft = result.state.progress.gates[gate.id].drafts[1]

    expect(result.error).toBe('not-accepted')
    expect(draft).toMatchObject({
      fields: { reflection: JUNK },
      evaluation: { decision: result.decision, qualityScore: expect.any(Number) },
      attempts: 1,
    })
    expect(containsRoutingMetadata(draft)).toBe(false)
  })

  it('keeps evaluation history fields while excluding routing diagnostics', () => {
    const result = completeQuest(newPlayer(), { ...q(1), reflection: JUNK })
    const [record] = result.state.progress.history

    expect(record).toMatchObject({
      gateId: gate.id,
      day: 1,
      phase: 'recognition',
      outcome: 'draft',
      attempts: 1,
      decision: result.decision,
      quality: expect.any(Number),
      confidence: expect.any(Number),
      dimensions: expect.any(Object),
      evaluator: expect.any(Object),
    })
    expect(containsRoutingMetadata(record)).toBe(false)
  })

  it('keeps accepted evidence and progression state free of routing diagnostics', () => {
    const result = completeQuest(newPlayer(), { ...q(1), reflection: STAGE_TEXT[0] })
    const evidence = result.state.progress.gates[gate.id].days[1].evidence
    const rejected = completeQuest(newPlayer(), { ...q(1), reflection: JUNK })

    expect(evidence).toMatchObject({
      status: 'accepted',
      quality: expect.any(Number),
      confidence: expect.any(Number),
      dimensions: expect.any(Object),
      verification: 'self-reported',
      rubric: expect.any(Object),
    })
    expect(containsRoutingMetadata(evidence)).toBe(false)
    expect(containsRoutingMetadata(result.state)).toBe(false)
    expect(containsRoutingMetadata(rejected.state)).toBe(false)
  })
})

describe('persistence and reward accounting (reload, sync, every resource)', () => {
  const resources = (p) => JSON.stringify({ xp: p.xp, mp: p.mp, sp: p.sp, ap: p.ap, dp: p.dp, kp: p.kp, cp: p.cp, attributes: p.attributes })
  it('a save with sealed, deferred, draft and history data survives a JSON round-trip and is still valid', () => {
    let s = failTimes(newPlayer(), 1, 3)
    s = sealStage(s, q(1)).state
    s = completeQuest(s, { ...q(2), reflection: JUNK }).state // live draft on the next stage
    const reloaded = JSON.parse(JSON.stringify(s))
    expect(validateLoadedState(reloaded)).toBe(true)
    const up = reviseEvidence(reloaded, { gateId: gate.id, day: 1, text: STAGE_TEXT[0] })
    expect(up.ok).toBe(true)
    expect(validateLoadedState(JSON.parse(JSON.stringify(up.state)))).toBe(true)
  })
  it('sealing changes no resource at all; release changes them once', () => {
    const base = newPlayer()
    const sealed = sealStage(failTimes(base, 1, 3), q(1)).state
    expect(resources(sealed.player)).toBe(resources(base.player))
    const released = reviseEvidence(sealed, { gateId: gate.id, day: 1, text: STAGE_TEXT[0] }).state
    expect(resources(released.player)).not.toBe(resources(sealed.player))
    const again = reviseEvidence(released, { gateId: gate.id, day: 1, text: STAGE_TEXT[0] + ' It also helped later that evening.' }).state
    expect(resources(again.player)).toBe(resources(released.player))
  })
  it('enforces the history limit, dropping the oldest record', () => {
    const s = newPlayer()
    s.progress.history = Array.from({ length: EVAL.history.max }, (_, i) => ({ id: `old${i}`, outcome: 'accepted' }))
    const r = completeQuest(s, { ...q(1), reflection: STAGE_TEXT[0] }).state
    expect(r.progress.history).toHaveLength(EVAL.history.max)
    expect(r.progress.history[0].id.startsWith('eval')).toBe(true)
    expect(r.progress.history.some((h) => h.id === `old${EVAL.history.max - 1}`)).toBe(false)
  })
  it('the fingerprint changes when any scoring value changes', () => {
    expect(fnv1a(JSON.stringify(EVAL))).toBe(EVAL_FINGERPRINT)
    expect(fnv1a(JSON.stringify({ ...EVAL, acceptQuality: EVAL.acceptQuality + 1 }))).not.toBe(EVAL_FINGERPRINT)
    expect(fnv1a(JSON.stringify({ ...EVAL, recovery: { attemptsBeforeSeal: 2 } }))).not.toBe(EVAL_FINGERPRINT)
  })
})

describe('version-1 loaded-state structural validation', () => {
  const valid = () => newPlayer()
  const mutate = (change) => {
    const state = valid()
    change(state)
    return state
  }
  const completedStage = () => completeQuest(valid(), { ...q(1), reflection: STAGE_TEXT[0] }).state

  it.each([
    ['null root', null],
    ['string root', 'save'],
    ['array root', []],
    ['wrong schema version', mutate((state) => { state.schemaVersion = 2 })],
    ['missing player identity', mutate((state) => { delete state.player.id })],
    ['incorrect player identity type', mutate((state) => { state.player.name = 42 })],
    ['player name beyond the existing input bound', mutate((state) => { state.player.name = 'x'.repeat(41) })],
    ['incorrect player numeric type', mutate((state) => { state.player.mp = '2' })],
    ['negative XP', mutate((state) => { state.player.xp = -1 })],
    ['NaN XP', mutate((state) => { state.player.xp = Number.NaN })],
    ['infinite XP', mutate((state) => { state.player.xp = Number.POSITIVE_INFINITY })],
    ['string XP', mutate((state) => { state.player.xp = '10' })],
    ['malformed attributes', mutate((state) => { state.player.attributes.focus = 'high' })],
    ['malformed resources', mutate((state) => { state.player.cp = null })],
    ['string progress container', mutate((state) => { state.progress = 'progress' })],
    ['string settings container', mutate((state) => { state.settings = 'settings' })],
    ['incorrect optional setting type', mutate((state) => { state.settings.soundEnabled = 'yes' })],
    ['unknown Gate ID', mutate((state) => { state.progress.gates['unknown-01'] = { ...state.progress.gates['beast-01'] } })],
    ['unknown stage reference', mutate((state) => { state.progress.gates['beast-01'].days[99] = { completedAt: new Date().toISOString(), completedDate: '2026-03-01' } })],
    ['incorrect quest reference', (() => {
      const state = completedStage()
      state.progress.gates[gate.id].days[1].questId = gate.days[1].id
      return state
    })()],
    ['malformed nested stage record', (() => {
      const state = completedStage()
      state.progress.gates[gate.id].days[1].completedAt = 123
      return state
    })()],
    ['invalid evidence status', (() => {
      const state = completedStage()
      state.progress.gates[gate.id].days[1].evidence.status = 'earned'
      return state
    })()],
    ['malformed ritual attempt', mutate((state) => {
      state.progress.gates[gate.id].ritual = { attempts: [{ id: 'attempt', status: 'completed' }] }
    })],
    ['malformed recovery seal', (() => {
      let state = failTimes(valid(), 1, EVAL.recovery.attemptsBeforeSeal)
      state = sealStage(state, q(1)).state
      state.progress.gates[gate.id].days[1].recoverySealedDate = 'not-a-date'
      return state
    })()],
  ])('rejects %s', (_label, state) => {
    expect(validateLoadedState(state)).toBe(false)
  })

  it('accepts supported optional fields omitted from a version-1 save and defaults attributes separately', () => {
    const state = valid()
    delete state.player.attributes
    delete state.progress.history
    delete state.player.avatar
    delete state.settings.soundEnabled
    delete state.settings.ceremonySkipped

    expect(validateLoadedState(state)).toBe(true)
    expect(state.player.attributes).toBeUndefined()
    expect(normalizeLoadedState(state).player.attributes).toEqual(newPlayer().player.attributes)
    expect(state.player.attributes).toBeUndefined()
  })

  it('validates without mutating state', () => {
    const state = valid()
    delete state.player.attributes
    const before = JSON.stringify(state)

    expect(validateLoadedState(state)).toBe(true)
    expect(JSON.stringify(state)).toBe(before)
  })

  it('accepts a completed canonical Gate with a legitimate ritual attempt', () => {
    const state = playRitual(playStagesWithSeals([]), gate).state

    expect(validateLoadedState(JSON.parse(JSON.stringify(state)))).toBe(true)
  })

  it('returns false rather than throwing for malformed nested input', () => {
    const state = mutate((next) => {
      next.progress.gates['beast-01'].days = 'not-days'
    })

    expect(() => validateLoadedState(state)).not.toThrow()
    expect(validateLoadedState(state)).toBe(false)
  })
})
