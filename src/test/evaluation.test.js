import { describe, it, expect } from 'vitest'
import { getGateById } from '@/data/catalog'
import { completeQuest } from '@/services/progression/engine'
import { evaluateSubmission, sanitizeProposal, scaleAttributes } from '@/services/evaluation/engine'
import { protocolFor, normalizeFields } from '@/services/evaluation/protocol'
import { adaptDifficulty, recommendNextPractice, rankCandidates } from '@/services/progression/recommend'
import { addDays } from '@/utils/dates'
import { STAGE_TEXT, JUNK, newPlayer, playStages } from './helpers'

const gate = getGateById('beast-01')
const day = (phase) => gate.days.find((d) => d.phase === phase)
const ev = (phase, input, extra = {}) => evaluateSubmission({ gate, day: day(phase), fields: typeof input === 'string' ? { reflection: input } : input, legacy: typeof input === 'string', ...extra })
const VAGUE = 'Attention and focus are important topics that people discuss often in many settings including schools offices families communities and online spaces where technology influences concentration habits and daily routines for everybody involved in modern life'
const COOKING = 'Yesterday I focused on cooking dinner for my family because the guests arrived early and I put extra salt in the soup, so next time I will taste first.'
const PERFECT = { dimensions: { actionSpecificity: 100, taskRelevance: 100, difficultyAwareness: 100, reflectionQuality: 100 }, confidence: 1 }

describe('submission protocol', () => {
  it('defines required fields per stage type; the Gate’s own prompt names the reflection', () => {
    expect(protocolFor(day('resistance')).fields.filter((f) => f.required).map((f) => f.id)).toEqual(['action', 'difficulty', 'outcome'])
    expect(protocolFor(day('trial')).fields.filter((f) => f.required).map((f) => f.id)).toEqual(['outcome', 'reflection'])
    const c = day('challenge')
    expect(protocolFor(c).fields.find((f) => f.id === 'reflection').label).toBe(c.prompt || 'What did you learn, or what will you change?')
  })
  it('keeps only known string fields', () => {
    expect(normalizeFields({ action: ' did it ', bogus: 'x', outcome: 5 })).toEqual({ action: 'did it' })
    expect(normalizeFields('nope')).toBe(null)
  })
})

describe('evaluation decisions (deterministic checks, then rubric, then policy)', () => {
  it('asks for missing required fields instead of guessing', () => {
    const r = ev('resistance', { action: 'I resisted the phone for thirty minutes.', outcome: 'It worked well.' })
    expect(r.decision).toBe('INSUFFICIENT_INFORMATION')
    expect(r.missingCriteria.map((m) => m.id)).toContain('difficulty')
  })
  it('abstains when there is too little to judge', () => {
    const r = ev('practice', 'Kept off my phone.')
    expect(r.decision).toBe('INSUFFICIENT_INFORMATION')
    expect(r.confidence).toBeLessThan(0.5)
  })
  it('keeps quality and confidence separate', () => {
    const vague = ev('practice', VAGUE)
    expect(vague.confidence).toBeGreaterThanOrEqual(0.8) // plenty to read...
    expect(vague.qualityScore).toBeLessThan(60) // ...and it is not good evidence
    expect(vague.decision).toBe('NEEDS_REVISION')
    expect(vague.feedback.length).toBeGreaterThan(0)
    const brief = ev('practice', { action: 'Turned off notifications and worked on my thesis chapter for forty minutes', outcome: 'Finished two pages and my attention held most of the time' })
    expect(brief.decision).toBe('ACCEPTED')
    expect(brief.confidence).toBeLessThan(0.7) // accepted, but the evaluator is less sure of a brief answer
  })
  it('flags well-formed text it cannot connect to the Gate, and copied text, for review', () => {
    expect(ev('application', 'Yesterday the barbecue with my cousins was wonderful because the sunshine stayed bright, and I learned that next time I will bring extra lemonade for everybody.').decision).toBe('REVIEW_REQUIRED')
    expect(ev('application', STAGE_TEXT[4], { others: [STAGE_TEXT[4]] }).decision).toBe('REVIEW_REQUIRED')
  })
  it('never claims verification: evidence is always self-reported', () => {
    expect(ev('application', STAGE_TEXT[4]).verification).toBe('self-reported')
  })
})

describe('AI boundary: an external evaluator may only propose scores', () => {
  it('clamps proposals and discards everything except dimensions, confidence and feedback', () => {
    const p = sanitizeProposal({ decision: 'ACCEPTED', xp: 99999, unlockGate: true, confidence: 7, dimensions: { actionSpecificity: 1e9, taskRelevance: '80', difficultyAwareness: -5, reflectionQuality: 50 } })
    expect(p.dimensions).toEqual({ actionSpecificity: 100, taskRelevance: 80, difficultyAwareness: 0, reflectionQuality: 50 })
    expect(p.confidence).toBe(1)
    expect(p.decision).toBe(undefined)
    expect(p.xp).toBe(undefined)
  })
  it('falls back to the rule-based evaluator when the proposal is malformed', () => {
    expect(sanitizeProposal({ dimensions: { actionSpecificity: 'Infinity' } })).toBe(null)
    const r = ev('application', STAGE_TEXT[4], { proposal: { dimensions: { actionSpecificity: 'x' } } })
    expect(r.fallback).toBe(true)
    expect(r.decision).toBe('ACCEPTED')
  })
  it('cannot rescue a submission that fails deterministic checks', () => {
    expect(ev('practice', JUNK, { proposal: PERFECT }).decision).toBe('INSUFFICIENT_INFORMATION')
  })
  it('sends large disagreements to review instead of accepting', () => {
    expect(ev('practice', VAGUE, { proposal: PERFECT }).decision).toBe('REVIEW_REQUIRED')
  })
  it('lets a semantic evaluator catch what word-matching misses', () => {
    expect(ev('application', COOKING).decision).toBe('ACCEPTED') // the rule-based baseline is fooled by one shared word
    const sem = { dimensions: { actionSpecificity: 100, taskRelevance: 0, difficultyAwareness: 100, reflectionQuality: 100 }, confidence: 0.9 }
    expect(ev('application', COOKING, { proposal: sem }).decision).toBe('REVIEW_REQUIRED')
  })
  it('cannot grant anything through the engine', () => {
    const r = completeQuest(newPlayer(), { gateId: gate.id, questId: gate.days[0].id, reflection: JUNK, proposal: PERFECT, dateKey: '2026-03-01' })
    expect(r.ok).toBe(false)
    expect(r.state.player.xp).toBe(0)
    expect(r.state.progress.gates[gate.id].days[1]).toBe(undefined)
  })
})

describe('rewards follow evaluation', () => {
  const q = { gateId: gate.id, questId: gate.days[0].id, dateKey: '2026-03-01' }
  it('a rejected submission earns nothing, is kept as a draft, and counts attempts', () => {
    const r = completeQuest(newPlayer(), { ...q, reflection: JUNK })
    expect(r.error).toBe('not-accepted')
    expect(r.state.player.xp).toBe(0)
    expect(r.state.progress.gates[gate.id].drafts[1].attempts).toBe(1)
    const r2 = completeQuest(r.state, { ...q, reflection: JUNK })
    expect(r2.state.progress.gates[gate.id].drafts[1].attempts).toBe(2)
  })
  it('an accepted resubmission pays XP exactly once and records the attempts', () => {
    const bad = completeQuest(newPlayer(), { ...q, reflection: JUNK })
    const ok = completeQuest(bad.state, { ...q, reflection: STAGE_TEXT[0] })
    expect(ok.ok).toBe(true)
    expect(ok.state.player.xp).toBeGreaterThan(0)
    expect(ok.state.progress.gates[gate.id].days[1].attempts).toBe(2)
    expect(ok.state.progress.gates[gate.id].drafts[1]).toBe(undefined)
    const again = completeQuest(ok.state, { ...q, reflection: STAGE_TEXT[0] })
    expect(again.error).toBe('already-complete')
  })
  it('stores guided fields with the evidence quality and grows attributes only when accepted', () => {
    const d = day('resistance')
    const s = playStages(newPlayer(), gate, { from: 1, to: 3 })
    const before = Object.values(s.player.attributes).reduce((a, b) => a + b, 0)
    const r = completeQuest(s, { gateId: gate.id, questId: d.id, dateKey: '2026-03-03', submission: { action: 'I kept working on my assignment when the urge to check Instagram came, and I put the phone in the hallway.', difficulty: 'The urge was strongest after about ten minutes because the task got hard.', outcome: 'I stayed with the task for twenty five minutes without checking.' } })
    expect(r.ok).toBe(true)
    const rec = r.state.progress.gates[gate.id].days[d.day]
    expect(rec.submission.action.length).toBeGreaterThan(10)
    expect(rec.evidence.verification).toBe('self-reported')
    expect(Object.values(r.state.player.attributes).reduce((a, b) => a + b, 0)).toBeGreaterThan(before)
  })
  it('scales attribute development with demonstrated quality, never below 1 for an accepted stage', () => {
    expect(scaleAttributes({ focus: 4, discipline: 2, awareness: 0 }, 50)).toEqual({ focus: 2, discipline: 1, awareness: 0 })
    expect(scaleAttributes({ focus: 4, discipline: 2 }, 100)).toEqual({ focus: 4, discipline: 2 })
    expect(scaleAttributes({ focus: 1 }, 60)).toEqual({ focus: 1 })
  })
})

describe('adaptive difficulty and candidate ranking', () => {
  const retried = (n) => {
    let s = newPlayer()
    for (let d = 1; d <= n; d += 1) {
      const base = { gateId: gate.id, questId: gate.days[d - 1].id, dateKey: addDays('2026-03-01', d - 1) }
      s = completeQuest(s, { ...base, reflection: JUNK }).state
      s = completeQuest(s, { ...base, reflection: STAGE_TEXT[d - 1] }).state
    }
    return s
  }
  it('is bounded: one result never moves it, two in a row can', () => {
    expect(adaptDifficulty([{ attempts: 3, quality: 20 }]).offset).toBe(0)
    expect(adaptDifficulty([{ attempts: 1, quality: 95 }, { attempts: 3, quality: 20 }]).offset).toBe(0)
    expect(adaptDifficulty([{ attempts: 2, quality: 90 }, { attempts: 1, quality: 50 }]).offset).toBe(-1)
    expect(adaptDifficulty([{ attempts: 1, quality: 90 }, { attempts: 1, quality: 100 }]).offset).toBe(1)
  })
  it('offers a lighter session automatically after repeated struggle, with its reason', () => {
    const rec = recommendNextPractice(retried(2), '2026-03-02')
    expect(rec.offset).toBe(-1)
    expect(rec.kind).toBe('stage')
    expect(rec.scaffold).toBe(true)
    expect(rec.minutes).toBeLessThan(gate.days[2].durationMinutes)
    expect(rec.reason.length).toBeGreaterThan(20)
    expect(rec.ranking[0].score).toBeGreaterThanOrEqual(rec.ranking[1].score)
  })
  it('only ever SUGGESTS a harder setting, never applies it', () => {
    // stages 4 and 5 were accepted first time with high quality: two in a row
    const rec = recommendNextPractice(playStages(newPlayer(), gate, { from: 1, to: 5, perDay: 1 }), '2026-03-05')
    expect(rec.offset).toBe(1)
    expect(rec.difficultySuggestion.to).toBe('austere')
    expect(rec.scaffold).toBe(undefined)
    expect(rec.minutes).toBe(Math.min(gate.days[5].durationMinutes, 25))
  })
  it('applies hard constraints before scoring: at the daily limit only rest remains', () => {
    const { ranked } = rankCandidates(playStages(newPlayer(), gate, { from: 1, to: 2, perDay: 2 }), '2026-03-01')
    expect(ranked).toHaveLength(1)
    expect(ranked[0].kind).toBe('tomorrow')
  })
  it('is deterministic', () => {
    const s = retried(2)
    expect(JSON.stringify(recommendNextPractice(s, '2026-03-02'))).toBe(JSON.stringify(recommendNextPractice(s, '2026-03-02')))
  })
})
