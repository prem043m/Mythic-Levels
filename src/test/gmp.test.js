import { describe, it, expect } from 'vitest'
import { getGateById } from '@/data/catalog'
import { completeQuest, ritualAction, reviseEvidence, getGateMastery } from '@/services/progression/engine'
import { evaluateGateCompletion } from '@/services/progression/mastery'
import { evaluateReflection } from '@/services/progression/reflection'
import { applyStreak } from '@/services/progression/streak'
import { recommendNextPractice } from '@/services/progression/recommend'
import { STAGE_TEXT, RITUAL_TEXT, JUNK, T0, newPlayer, playStages, playRitual } from './helpers'

const gate = getGateById('beast-01')

describe('reflection rubric', () => {
  it('treats empty as none and padding as needing revision (no character-count loophole)', () => {
    expect(evaluateReflection('', { gate }).status).toBe('none')
    expect(evaluateReflection(JUNK, { gate }).status).toBe('needs-revision')
    expect(evaluateReflection('ok '.repeat(30), { gate }).status).toBe('needs-revision')
  })
  it('accepts a specific, relevant reflection at every stage', () => {
    gate.days.forEach((d, i) => expect(evaluateReflection(STAGE_TEXT[i], { gate, phase: d.phase }).status).toBe('accepted'))
  })
  it('rejects fluent text with no connection to the Gate, and gives actionable feedback', () => {
    const r = evaluateReflection('Yesterday the barbecue with my cousins was wonderful because the sunshine stayed bright, and I learned that next time I will bring extra lemonade for everybody.', { gate })
    expect(r.status).toBe('needs-revision')
    expect(r.feedback.length).toBeGreaterThan(0)
  })
  it('flags copy-pasted reflections', () => {
    expect(evaluateReflection(STAGE_TEXT[0], { gate, phase: 'practice', others: [STAGE_TEXT[0]] }).criteria.specificity).toBe(false)
  })
})

describe('stage rules', () => {
  it('enforces stage order, no duplicates, and the daily stage limit', () => {
    const s = newPlayer()
    expect(completeQuest(s, { gateId: gate.id, questId: gate.days[1].id, reflection: STAGE_TEXT[1], dateKey: '2026-03-01' }).error).toBe('stage-locked')
    const a = playStages(s, gate, { from: 1, to: 2, perDay: 2 })
    expect(completeQuest(a, { gateId: gate.id, questId: gate.days[0].id, dateKey: '2026-03-02' }).error).toBe('already-complete')
    expect(completeQuest(a, { gateId: gate.id, questId: gate.days[2].id, reflection: STAGE_TEXT[2], dateKey: '2026-03-01' }).error).toBe('daily-stage-limit')
  })
  it('does not let the trial be ticked off like a quest', () => {
    expect(completeQuest(playStages(newPlayer(), gate), { gateId: gate.id, questId: gate.bossTrial.id, reflection: RITUAL_TEXT }).error).toBe('ritual-required')
  })
})

describe('final ritual', () => {
  const ready = () => playStages(newPlayer(), gate)
  const act = (state, action, payload, now) => ritualAction(state, { gateId: gate.id, action, payload, now, dateKey: '2026-03-10' })

  it('needs every stage first, and an intention and preparation', () => {
    expect(act(newPlayer(), 'prepare', { task: 'x task', intention: 'y intent', checked: 4 }, T0).error).toBe('stages-incomplete')
    expect(act(ready(), 'prepare', { task: '', intention: '', checked: 4 }, T0).error).toBe('intention-missing')
    expect(act(ready(), 'prepare', { task: 'Write', intention: 'Focus', checked: 2 }, T0).error).toBe('preparation-incomplete')
  })
  it('is recoverable: too short keeps the attempt, an interruption pauses time, a backwards clock cannot cheat', () => {
    let r = act(ready(), 'prepare', { task: 'Write report', intention: 'One task', checked: 4 }, T0)
    r = act(r.state, 'start', {}, T0)
    const early = act(r.state, 'finish', { outcome: 'yes', noInterruptions: true, selfRating: 4, reflection: RITUAL_TEXT }, T0 + 10 * 60000)
    expect(early.error).toBe('too-short')
    expect(early.needed).toBe(36)
    const paused = act(r.state, 'pause', { note: 'Phone call from my sister' }, T0 + 20 * 60000)
    const resumed = act(paused.state, 'resume', {}, T0 + 50 * 60000) // 30 minutes away: not counted
    const tooShort = act(resumed.state, 'finish', { outcome: 'yes', selfRating: 4, reflection: RITUAL_TEXT }, T0 + 55 * 60000)
    expect(tooShort.error).toBe('too-short') // 20 + 5 = 25 active minutes
    const done = act(resumed.state, 'finish', { outcome: 'partly', selfRating: 4, reflection: RITUAL_TEXT }, T0 + 80 * 60000) // 20 + 30
    expect(done.ok).toBe(true)
    expect(done.state.progress.gates[gate.id].ritual.attempts[0].activeMinutes).toBe(50)
    const back = act(resumed.state, 'finish', { outcome: 'yes', selfRating: 4, reflection: RITUAL_TEXT }, T0 - 99999999)
    expect(back.error).toBe('too-short')
  })
  it('requires an observation record, an outcome, a self-assessment and an accepted reflection', () => {
    let r = act(ready(), 'prepare', { task: 'Write report', intention: 'One task', checked: 4 }, T0)
    r = act(r.state, 'start', {}, T0)
    const at = T0 + 45 * 60000
    expect(act(r.state, 'finish', { outcome: 'yes', selfRating: 4, reflection: RITUAL_TEXT }, at).error).toBe('observation-missing')
    expect(act(r.state, 'finish', { noInterruptions: true, selfRating: 4, reflection: RITUAL_TEXT }, at).error).toBe('outcome-missing')
    expect(act(r.state, 'finish', { outcome: 'yes', noInterruptions: true, reflection: RITUAL_TEXT }, at).error).toBe('self-assessment-missing')
    const bad = act(r.state, 'finish', { outcome: 'yes', noInterruptions: true, selfRating: 4, reflection: JUNK }, at)
    expect(bad.error).toBe('reflection-needs-revision')
    expect(bad.feedback.length).toBeGreaterThan(0)
  })
  it('can be abandoned and begun again without losing the Gate', () => {
    let r = act(ready(), 'prepare', { task: 'Write report', intention: 'One task', checked: 4 }, T0)
    r = act(r.state, 'abandon', {}, T0)
    expect(act(r.state, 'prepare', { task: 'Write report', intention: 'Try again', checked: 4 }, T0 + 1000).ok).toBe(true)
  })
})

describe('Gate Mastery Protocol', () => {
  it('completes a properly practised Gate exactly once, and unlocks the next', () => {
    const r = playRitual(playStages(newPlayer(), gate), gate)
    expect(r.ok).toBe(true)
    const rec = r.state.progress.gates[gate.id]
    expect(rec.completedAt).toBeTruthy()
    expect(r.state.progress.gates['beast-02'].unlocked).toBe(true)
    expect(r.ascension.kind).toBe('gate')
    expect(new Set(r.state.player.achievements).size).toBe(r.state.player.achievements.length)
    const xp = r.state.player.xp
    const again = ritualAction(r.state, { gateId: gate.id, action: 'finish', payload: {}, now: T0 })
    expect(again.ok).toBe(false)
    expect(r.state.player.xp).toBe(xp)
  })
  it('is idempotent: evaluating or revising a completed Gate never re-awards', () => {
    const done = playRitual(playStages(newPlayer(), gate), gate).state
    expect(evaluateGateCompletion(done, gate.id)).toEqual(evaluateGateCompletion(done, gate.id))
    const rev = reviseEvidence(done, { gateId: gate.id, day: 1, text: STAGE_TEXT[0] })
    expect(rev.ok).toBe(true)
    expect(rev.state.player.xp).toBe(done.player.xp)
    expect(rev.state.player.titles).toEqual(done.player.titles)
    expect(rev.ascension).toBe(null)
  })
  it('explains what is missing instead of one opaque percentage', () => {
    const e = evaluateGateCompletion(playStages(newPlayer(), gate, { from: 1, to: 3 }), gate.id)
    expect(e.status).toBe('IN_PROGRESS')
    const ids = e.missing.map((m) => m.id)
    for (const id of ['stages', 'days', 'reflections', 'ritual']) expect(ids).toContain(id)
  })
  it('returns NEEDS_MORE_PRACTICE when mandatory parts pass but quality is thin, and recovers by revising', () => {
    const texts = STAGE_TEXT.map((t, i) => ([0, 3, 6].includes(i) ? JUNK : t))
    const base = newPlayer()
    base.settings.masteryThreshold = 0.75 // a stricter setting, to exercise the quality gate
    const run = playRitual(playStages(base, gate, { texts }), gate, { minutes: 36, outcome: 'no' })
    const e = evaluateGateCompletion(run.state, gate.id)
    expect(e.status).toBe('NEEDS_MORE_PRACTICE')
    expect(run.state.progress.gates[gate.id].completedAt).toBe(null)
    let s = run.state
    let last
    for (const d of [1, 4, 7]) { last = reviseEvidence(s, { gateId: gate.id, day: d, text: STAGE_TEXT[d - 1] }); s = last.state }
    expect(getGateMastery(s, gate.id).mastery).toBeGreaterThan(e.mastery)
    expect(s.progress.gates[gate.id].completedAt).toBeTruthy()
  })
  it('grandfathers a trial finished under the previous rules', () => {
    const s = playStages(newPlayer(), gate)
    s.progress.gates[gate.id].bossCompletedAt = '2026-01-01T00:00:00.000Z'
    expect(evaluateGateCompletion(s, gate.id).signals.finalTrial).toBe(1)
  })
  it('never lets a locked Gate be evaluated as progress', () => {
    expect(evaluateGateCompletion(newPlayer(), 'beast-05').status).toBe('IN_PROGRESS')
    expect(completeQuest(newPlayer(), { gateId: 'beast-05', questId: getGateById('beast-05').days[0].id }).ok).toBe(false)
  })
})

describe('streak', () => {
  const s0 = { current: 3, longest: 3, lastActiveDate: '2026-03-06', interrupted: false } // a Friday
  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri']
  it('starts, continues, and ignores same-day or backwards dates', () => {
    expect(applyStreak({ current: 0, longest: 0, lastActiveDate: null }, '2026-03-06').kind).toBe('started')
    expect(applyStreak(s0, '2026-03-07').kind).toBe('continued')
    expect(applyStreak(s0, '2026-03-06').kind).toBe('same-day')
    expect(applyStreak(s0, '2026-03-01').streak.current).toBe(3)
  })
  it('skips rest days but not practice days', () => {
    expect(applyStreak(s0, '2026-03-09', weekdays)).toMatchObject({ kind: 'continued', streak: { current: 4 } }) // Sat+Sun are rest
    expect(applyStreak(s0, '2026-03-10', weekdays)).toMatchObject({ kind: 'returned', streak: { current: 1, longest: 3 } }) // Monday missed
  })
})

describe('adaptive recommendation', () => {
  it('suggests a gentle re-entry after time away, with a reason', () => {
    const s = playStages(newPlayer(), gate, { from: 1, to: 2, perDay: 1 })
    const r = recommendNextPractice(s, '2026-03-20')
    expect(r.kind).toBe('re-entry')
    expect(r.minutes).toBeLessThanOrEqual(10)
    expect(r.reason.length).toBeGreaterThan(20)
  })
  it('points to the ritual once every stage is done, and to revision when evidence is weak', () => {
    expect(recommendNextPractice(playStages(newPlayer(), gate), '2026-03-04').kind).toBe('ritual')
    const weak = playStages(newPlayer(), gate, { texts: STAGE_TEXT.map((t, i) => (i === 1 ? JUNK : t)) })
    expect(recommendNextPractice(weak, '2026-03-04').kind).toBe('revise')
  })
  it('stops at the daily limit and never changes state', () => {
    const s = playStages(newPlayer(), gate, { from: 1, to: 2, perDay: 2 })
    const before = JSON.stringify(s)
    expect(recommendNextPractice(s, '2026-03-01').kind).toBe('tomorrow')
    expect(JSON.stringify(s)).toBe(before)
  })
})
