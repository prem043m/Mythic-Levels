import { describe, it, expect, vi } from 'vitest'

const { reflectionEvaluationSpy } = vi.hoisted(() => ({ reflectionEvaluationSpy: vi.fn() }))

vi.mock('@/services/progression/reflection', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    evaluateReflection: (...args) => {
      reflectionEvaluationSpy(...args)
      return actual.evaluateReflection(...args)
    },
  }
})

import { getGateById } from '@/data/catalog'
import { createGateProgress } from '@/domain/models'
import { completeQuest, getGateMastery } from '@/services/progression/engine'
import { evaluateSubmission, sanitizeProposal, scaleAttributes } from '@/services/evaluation/engine'
import { protocolFor, normalizeFields } from '@/services/evaluation/protocol'
import { EVAL } from '@/config/evaluation'
import { adaptDifficulty, recommendNextPractice, rankCandidates } from '@/services/progression/recommend'
import { addDays } from '@/utils/dates'
import { STAGE_TEXT, JUNK, newPlayer, playStages } from './helpers'
import humanFixture from './calibration/human-v1/human-evaluation-v1.json'

const gate = getGateById('beast-01')
const day = (phase) => gate.days.find((d) => d.phase === phase)
const ev = (phase, input, extra = {}) => evaluateSubmission({ gate, day: day(phase), fields: typeof input === 'string' ? { reflection: input } : input, legacy: typeof input === 'string', ...extra })
const trollGate = getGateById('beast-02')
const trollObservation = trollGate.days.find((d) => d.phase === 'observation')
const humanGate = getGateById(humanFixture.quest.gateId)
const humanChallenge = humanGate.days.find((d) => d.phase === humanFixture.quest.phase)
const humanCase = (id) => humanFixture.submissions.find((submission) => submission.id === id)
const VAGUE = 'Attention and focus are important topics that people discuss often in many settings including schools offices families communities and online spaces where technology influences concentration habits and daily routines for everybody involved in modern life'
const COOKING = 'Yesterday I focused on cooking dinner for my family because the guests arrived early and I put extra salt in the soup, so next time I will taste first.'
const KEYWORD_STUFFED_COOKING = 'Yesterday I focused my attention and practiced discipline while cooking dinner. I resisted checking my phone, noticed my focus, stayed focused, and learned that attention matters. I chopped vegetables, stirred the soup, and served dinner.'
const KEYWORD_ONLY_COOKING = 'Focus, attention, and discipline are useful ideas. I cooked dinner for my family, added extra salt, and next time I will taste first.'
const AMBIGUOUS_STUDY = {
  situation: 'Yesterday at the library.',
  action: 'I read some pages and moved between my notes and messages.',
  difficulty: 'It was difficult to keep attention because I felt tired.',
  outcome: 'I finished part of the reading and noticed the interruptions.',
}
const STUDY_SUBMISSION = {
  situation: 'Yesterday at my desk during a study session.',
  action: 'I turned off notifications and worked on my thesis chapter for forty minutes.',
  difficulty: 'I was distracted by my phone because studying felt hard.',
  outcome: 'I finished two pages and my attention held most of the time.',
  reflection: 'I learned that putting the phone away helped me focus.',
}
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
    expect(brief.routing.classification).toBe('SEMANTIC_REVIEW_REQUIRED')
    expect(brief.routing.reason).toBe('uncertain-action-evidence')
    expect(brief.confidence).toBeLessThan(0.7) // accepted, but the evaluator is less sure of a brief answer
  })
  it('rejects the exact sparse Troll Observation submission without granting progression or rewards', () => {
    const fields = { situation: 'Yesterday.', difficulty: 'Nothing.', outcome: 'It happened.', reflection: 'Empty.' }
    const state = newPlayer()
    const trollProgress = createGateProgress(trollGate.id)
    trollProgress.unlocked = true
    trollProgress.days[1] = {
      completedAt: '2026-03-01T00:00:00.000Z',
      completedDate: '2026-03-01',
      phase: 'recognition',
      questId: trollGate.days[0].id,
    }
    state.progress.gates[trollGate.id] = trollProgress
    const before = {
      xp: state.player.xp,
      resources: [state.player.mp, state.player.sp, state.player.ap, state.player.dp, state.player.kp, state.player.cp],
      attributes: { ...state.player.attributes },
      questsCompleted: state.progress.questsCompleted,
      practiceMinutes: state.progress.practiceMinutes,
      mastery: getGateMastery(state, trollGate.id).mastery,
      currentArcana: state.player.currentArcana,
      currentGate: state.player.currentGate,
      completedAt: trollProgress.completedAt,
      nextGateUnlocked: Boolean(state.progress.gates['beast-03']?.unlocked),
    }
    const evaluated = evaluateSubmission({ gate: trollGate, day: trollObservation, fields })
    const result = completeQuest(state, {
      gateId: trollGate.id,
      questId: trollObservation.id,
      submission: fields,
      dateKey: '2026-03-02',
    })

    expect(evaluated.decision).toBe('INSUFFICIENT_INFORMATION')
    expect(evaluated.routing.classification).toBe('FAST_PATH_REJECTABLE')
    expect(evaluated.routing.providerEligible).toBe(false)
    expect(result.error).toBe('not-accepted')
    expect(result.decision).toBe(evaluated.decision)
    expect(result.state.player.xp).toBe(before.xp)
    expect([result.state.player.mp, result.state.player.sp, result.state.player.ap, result.state.player.dp, result.state.player.kp, result.state.player.cp]).toEqual(before.resources)
    expect(result.state.player.attributes).toEqual(before.attributes)
    expect(result.state.progress.questsCompleted).toBe(before.questsCompleted)
    expect(result.state.progress.practiceMinutes).toBe(before.practiceMinutes)
    expect(getGateMastery(result.state, trollGate.id).mastery).toBe(before.mastery)
    expect(result.state.player.currentArcana).toBe(before.currentArcana)
    expect(result.state.player.currentGate).toBe(before.currentGate)
    expect(result.state.progress.gates[trollGate.id].days[trollObservation.day]).toBe(undefined)
    expect(result.state.progress.gates[trollGate.id].completedAt).toBe(before.completedAt)
    expect(Boolean(result.state.progress.gates['beast-03']?.unlocked)).toBe(before.nextGateUnlocked)
  })
  it('does not accept the H19 attempt that never started, even with a favorable proposal', () => {
    const unsuccessful = evaluateSubmission({
      gate: humanGate,
      day: humanChallenge,
      fields: humanCase('H19').fields,
    })
    const proposedAccept = evaluateSubmission({
      gate: humanGate,
      day: humanChallenge,
      fields: humanCase('H19').fields,
      proposal: { dimensions: { actionSpecificity: 80, taskRelevance: 80, difficultyAwareness: 80, reflectionQuality: 80 }, confidence: 0.9 },
    })

    expect(unsuccessful.decision).not.toBe('ACCEPTED')
    expect(proposedAccept.decision).not.toBe('ACCEPTED')
    expect(unsuccessful.routing.classification).toBe('FAST_PATH_REJECTABLE')
    expect(proposedAccept.routing.providerEligible).toBe(false)
  })
  it('accepts contextual evidence of resisting distraction despite negated wording', () => {
    const resistance = evaluateSubmission({
      gate,
      day: day('resistance'),
      fields: {
        situation: 'Yesterday at my desk during a study session.',
        action: 'I did not check my phone during the study session. I returned to my reading after each urge and finished two pages.',
        difficulty: 'The urge to check messages was strongest when the chapter became difficult.',
        outcome: 'I completed the planned reading without checking messages and my focus stayed with the chapter.',
      },
    })

    expect(resistance.decision).toBe('ACCEPTED')
  })
  it('accepts a valid no-difficulty report', () => {
    const noDifficulty = evaluateSubmission({
      gate: humanGate,
      day: humanChallenge,
      fields: humanCase('H15').fields,
    })

    expect(noDifficulty.decision).toBe('ACCEPTED')
  })
  it('flags well-formed text it cannot connect to the Gate, and copied text, for review', () => {
    expect(ev('application', 'Yesterday the barbecue with my cousins was wonderful because the sunshine stayed bright, and I learned that next time I will bring extra lemonade for everybody.').decision).toBe('REVIEW_REQUIRED')
    expect(ev('application', STAGE_TEXT[4], { others: [STAGE_TEXT[4]] }).decision).toBe('REVIEW_REQUIRED')
  })
  it('accepts a concise, relevant imperfect-English account', () => {
    const r = ev('application', {
      situation: 'Yesterday at library.',
      action: 'Phone buzzed, I put it away and studied.',
      difficulty: 'Phone pulled me away because work was hard.',
      outcome: 'I finish my report and felt more focus.',
    })
    expect(r.decision).toBe('ACCEPTED')
    expect(r.routing.classification).toBe('FAST_PATH_ACCEPTABLE')
  })
  it('accepts a study submission for its relevant Gate', () => {
    const focused = evaluateSubmission({ gate, day: day('application'), fields: STUDY_SUBMISSION })

    expect(focused.decision).toBe('ACCEPTED')
    expect(focused.routing.classification).toBe('FAST_PATH_ACCEPTABLE')
  })
  it('does not transfer acceptance to an unrelated Gate', () => {
    const unrelatedTroll = evaluateSubmission({ gate: trollGate, day: trollObservation, fields: STUDY_SUBMISSION })

    expect(unrelatedTroll.decision).not.toBe('ACCEPTED')
    expect(unrelatedTroll.routing.classification).toBe('SEMANTIC_REVIEW_REQUIRED')
  })
  it('routes the previously accepted ambiguous study submission for semantic review', () => {
    const ambiguous = evaluateSubmission({ gate, day: day('application'), fields: AMBIGUOUS_STUDY })

    expect(ambiguous.decision).toBe('ACCEPTED')
    expect(ambiguous.routing.classification).toBe('SEMANTIC_REVIEW_REQUIRED')
    expect(ambiguous.routing.reason).toBe('uncertain-objective-alignment')
    expect(ambiguous.routing.providerEligible).toBe(true)
  })
  it('runs deterministic baseline analysis once and routes from that evaluation', () => {
    reflectionEvaluationSpy.mockClear()
    const result = evaluateSubmission({ gate, day: day('application'), fields: STUDY_SUBMISSION })

    expect(reflectionEvaluationSpy).toHaveBeenCalledTimes(1)
    expect(result.decision).toBe('ACCEPTED')
    expect(result.routing.classification).toBe('FAST_PATH_ACCEPTABLE')
  })
  it('does not let keyword-stuffed cooking qualify for the acceptable fast path', () => {
    const unrelated = ev('application', KEYWORD_ONLY_COOKING)

    expect(unrelated.decision).not.toBe('ACCEPTED')
    expect(unrelated.routing.classification).not.toBe('FAST_PATH_ACCEPTABLE')
  })
  it('accepts independently evaluated evidence that is relevant to the Troll Gate', () => {
    const relevantTroll = evaluateSubmission({
      gate: trollGate,
      day: trollObservation,
      fields: {
        situation: 'Yesterday evening I spoke with my sister at home.',
        action: 'I listened until she finished and wrote five lines of what she actually said without preparing a rebuttal.',
        difficulty: 'I wanted to plan my response because I disagreed with her.',
        outcome: 'I checked my notes and noticed that I had missed the part about her schedule.',
      },
    })

    expect(relevantTroll.decision).toBe('ACCEPTED')
  })
  it('requires revision for an otherwise valid submission over the configured length limit', () => {
    const vocabulary = 'phone focus attention report study task work notifications distraction discipline concentration messages planning progress effort review completion chapter lesson practice moment trigger choice routine environment interruption response intention priority quiet notes reading writing'.split(' ')
    const longAction = `I worked on my report. ${Array.from({ length: 30 }, () => vocabulary.join(' ')).join(' ')}`
    const fields = {
      situation: 'Yesterday at my desk during a focused work session.',
      action: longAction,
      outcome: 'I completed my report and learned what distracted me.',
    }
    const r = ev('application', fields)

    expect(longAction.length + fields.situation.length + fields.outcome.length).toBeGreaterThan(EVAL.maxNarrativeChars)
    expect(r.decision).toBe('NEEDS_REVISION')
    expect(r.feedback.join(' ')).toContain(String(EVAL.maxNarrativeChars))
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
  it('does not accept an unrelated cooking response based on a single Gate-related keyword', () => {
    expect(ev('application', COOKING).decision).not.toBe('ACCEPTED')
  })
  it('accepts relevant practice during cooking even when it mentions several Gate keywords', () => {
    expect(ev('application', KEYWORD_STUFFED_COOKING).decision).toBe('ACCEPTED')
  })
  it('does not accept Gate keywords without evidence of practicing the objective', () => {
    expect(ev('application', KEYWORD_ONLY_COOKING).decision).not.toBe('ACCEPTED')
  })
  it('keeps external semantic proposals from overriding unrelated evidence', () => {
    const sem = { dimensions: { actionSpecificity: 100, taskRelevance: 0, difficultyAwareness: 100, reflectionQuality: 100 }, confidence: 0.9 }
    expect(ev('application', COOKING, { proposal: sem }).decision).toBe('REVIEW_REQUIRED')
  })
  it('requires review when proposals conflict with missing relevance evidence at every score', () => {
    for (const taskRelevance of [0, 25, 49, 50, 100]) {
      const proposal = { ...PERFECT, dimensions: { ...PERFECT.dimensions, taskRelevance } }
      const result = ev('application', COOKING, { proposal })

      expect(result.legacyCriteria.relevance).toBe(false)
      expect(result.decision).toBe('REVIEW_REQUIRED')
    }
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
