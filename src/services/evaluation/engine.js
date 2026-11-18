import { EVAL, EVAL_FINGERPRINT } from '@/config/evaluation'
import { evaluateReflection } from '@/services/progression/reflection'
import { tokenize, jaccard } from '@/utils/text'
import { protocolFor, narrativeOf } from '@/services/evaluation/protocol'

export const DECISION = { ACCEPTED: 'ACCEPTED', NEEDS_REVISION: 'NEEDS_REVISION', INSUFFICIENT_INFORMATION: 'INSUFFICIENT_INFORMATION', REVIEW_REQUIRED: 'REVIEW_REQUIRED' }
export const DIMS = ['actionSpecificity', 'taskRelevance', 'difficultyAwareness', 'reflectionQuality']
const DIM_HINT = {
  actionSpecificity: 'Describe what you actually did, step by step, and when and where.',
  taskRelevance: 'Connect it to this Gate’s theme; it does not seem to touch what this Gate trains.',
  difficultyAwareness: 'Name what made it hard, or what pulled you away.',
  reflectionQuality: 'Say what you learned, or what you will change next time.',
}
const distinct = (text) => new Set(tokenize(text)).size
const rubricFor = (phase) => EVAL.phases[phase] || { weights: EVAL.defaultWeights, key: [] }
const quality = (dims, weights) => Math.round(DIMS.reduce((s, d) => s + dims[d] * weights[d], 0))
const TASK_NOT_STARTED = /\b(?:did not|didn't|never)\s+(?:start(?:ed|ing)?|begin|began|begun)\b|\bstopped before (?:starting|beginning)\b/i
const taskNotStarted = (fields) => TASK_NOT_STARTED.test(`${fields.action || ''}\n${fields.outcome || ''}`)

// High-precision consistency checks. They only fire on unambiguous patterns and only ask the player to CLARIFY
// (REVIEW_REQUIRED, never a rejection). Real contradiction detection needs semantic understanding (the Gemini evaluator).
const ABSOLUTE_NEG = /\bI\s+(?:did not|didn't|have not|haven't|could not|couldn't)\s+(\w+)\s+(?:at all|even once|anything)\b/i
const NEG_SCOPE = /\b(yesterday|earlier|before|until|while|during|after|when|first|initially|morning|afternoon|evening|last|then)\b/i
const SEQUENCE = /\b(once|twice|later|afterwards|afterward|then|eventually|briefly|again)\b/i
const root = (w) => w.toLowerCase().replace(/(ing|ed|es|e|s)$/, '')
export function consistencyIssues(narrative) {
  const issues = []
  const negatedActions = []
  for (const sentence of narrative.split(/[.!?;\n]+/)) {
    const m = ABSOLUTE_NEG.exec(sentence)
    if (m) {
      const rest = sentence.slice(m.index + m[0].length)
      const clauses = rest.split(/,|\bbut\b|\band\b|\bso\b/i)
      const verb = root(m[1])
      if (verb.length >= 3 && !NEG_SCOPE.test(clauses[0] || '')) {
        const contradicted = clauses.slice(1).some((c) => !SEQUENCE.test(c) && [...c.matchAll(/\bI\s+(?:just\s+|also\s+)?([a-z]+)\b/gi)].some((x) => root(x[1]) === verb))
        if (contradicted) issues.push({ id: 'negation-conflict', message: `You wrote that you did not ${m[1]} at all, and also that you did. Which one happened? Please clarify.` })
      }
    }
    for (const match of sentence.matchAll(/\bI\s+(?:did not|didn't|have not|haven't|could not|couldn't|never)\s+([a-z]+)\b([^,;]*)/gi)) {
      negatedActions.push({ verb: root(match[1]), tail: match[2] })
    }
  }
  for (const negated of negatedActions) {
    if (NEG_SCOPE.test(negated.tail)) continue
    const positive = [...narrative.matchAll(/\bI\s+(?:(?:then|just|also|immediately|quickly|finally|simply)\s+)?([a-z]+)\b([^.!?;\n]*)/gi)]
      .find((match) => root(match[1]) === negated.verb && !/\b(?:did not|didn't|have not|haven't|could not|couldn't|never)\s*$/i.test(narrative.slice(Math.max(0, match.index - 16), match.index)))
    if (!positive) continue
    const context = narrative.slice(Math.max(0, positive.index - 24), positive.index + positive[0].length)
    if (SEQUENCE.test(context)) continue
    const negatedTarget = new Set(tokenize(negated.tail))
    const positiveTarget = tokenize(positive[2])
    if (negatedTarget.size && positiveTarget.length && !positiveTarget.some((token) => negatedTarget.has(token))) continue
    issues.push({ id: 'negation-conflict', message: 'You describe both not doing and doing the same action. Please clarify what happened.' })
    break
  }
  for (const m of narrative.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/gi)) {
    if (Number(m[1]) > 16) issues.push({ id: 'implausible-duration', message: 'That duration looks very long for one session. Please check the number.' })
  }
  return issues
}

/** Baseline evaluator: deterministic, explainable, offline. Judges structure and Gate vocabulary, never truth. */
export function ruleBasedEvaluator({ gate, day, fields, narrative, others, legacy = false }) {
  const ev = evaluateReflection(narrative, { gate, day, phase: day.phase, others })
  const c = ev.criteria
  const has = (id, n = 4) => distinct(fields[id] || '') >= n // a guided field answered with real content
  const action = c.application || has('action')
  const situation = c.specificity || has('situation')
  const noStart = taskNotStarted(fields)
  const dimensions = {
    actionSpecificity: noStart ? 0 : (action ? 50 : 0) + (situation ? 50 : 0),
    taskRelevance: !noStart && c.relevance && (ev.signals?.unique ?? 0) >= 4 ? Math.min(100, (ev.signals?.overlap ?? 0) * 50) : 0,
    difficultyAwareness: c.awareness || has('difficulty') ? 100 : 0,
    // A dedicated reflection answer earns partial credit; in single-text mode the whole text is not a reflection answer.
    reflectionQuality: c.learning ? 100 : !legacy && has('reflection', 6) ? 50 : 0,
  }
  const unique = ev.signals?.unique ?? 0
  const volume = Math.min(1, unique / EVAL.fullConfidenceTokens)
  const spread = Math.max(...Object.values(dimensions)) - Math.min(...Object.values(dimensions))
  // Confidence = how much the evaluator has to go on (volume), slightly reduced when its own signals disagree.
  const confidence = Math.round((0.3 + 0.7 * volume) * (spread >= 100 ? 0.9 : 1) * 100) / 100
  return {
    dimensions,
    confidence,
    criteria: c,
    keys: ev.keys,
    signals: ev.signals,
    evaluator: { name: 'rule-based', version: EVAL.rubricVersion },
  }
}

/** An external (e.g. LLM) evaluator may only PROPOSE scores. Everything else it says is discarded here. */
export function sanitizeProposal(raw) {
  if (!raw || typeof raw !== 'object' || !raw.dimensions || typeof raw.dimensions !== 'object') return null
  const dimensions = {}
  for (const d of DIMS) {
    const v = Number(raw.dimensions[d])
    if (!Number.isFinite(v)) return null
    dimensions[d] = Math.min(100, Math.max(0, Math.round(v)))
  }
  const conf = Number(raw.confidence)
  return {
    dimensions,
    confidence: Number.isFinite(conf) ? Math.min(1, Math.max(0, conf)) : 0,
    feedback: Array.isArray(raw.feedback) ? raw.feedback.filter((s) => typeof s === 'string').slice(0, 3).map((s) => s.slice(0, 200)) : [],
    evaluator: { name: String(raw.evaluator || 'external').slice(0, 40), version: String(raw.version || '').slice(0, 20) },
  }
}

/**
 * Pipeline: deterministic validation -> evaluator (rule-based, optionally an external proposal) -> decision policy.
 * Pure. Returns quality and confidence as SEPARATE values; the decision is made only here, by rules.
 */
export function evaluateSubmission({ gate, day, fields, legacy = false, others = [], proposal = null }) {
  const protocol = protocolFor(day)
  const narrative = narrativeOf(fields)
  const tokens = tokenize(narrative)
  const rubric = rubricFor(day.phase)

  // 1. Deterministic checks (no AI involved).
  const missing = legacy
    ? (distinct(narrative) < EVAL.minFieldTokens ? [{ id: 'reflection', reason: 'too-short' }] : [])
    : protocol.fields.filter((f) => f.required && distinct(fields[f.id] || '') < EVAL.minFieldTokens)
      .map((f) => ({ id: f.id, label: f.label, reason: fields[f.id] ? 'too-short' : 'missing' }))
  const duplicate = others.some((o) => o && jaccard(tokens, tokenize(o)) >= 0.8)
  const issues = consistencyIssues(narrative)
  const tooLong = narrative.length > EVAL.maxNarrativeChars
  const noStart = taskNotStarted(fields)

  // 2. Evaluation. The rule-based baseline always runs; an external proposal is used only if it is well-formed.
  const base = ruleBasedEvaluator({ gate, day, fields, narrative, others, legacy })
  const external = proposal ? sanitizeProposal(proposal) : null
  const used = external || base
  const dims = used.dimensions
  const q = quality(dims, rubric.weights)
  const baseQ = quality(base.dimensions, rubric.weights)
  const confidence = used.confidence
  const disagreement = external ? q - baseQ : 0

  // 3. Decision policy.
  const weak = DIMS.filter((d) => dims[d] < EVAL.keyFloor).sort((a, b) => (rubric.key.includes(b) ? 1 : 0) - (rubric.key.includes(a) ? 1 : 0))
  let decision
  let missingCriteria = []
  let feedback = []
  if (missing.length) { decision = DECISION.INSUFFICIENT_INFORMATION; missingCriteria = missing; feedback = missing.map((m) => (m.reason === 'missing' ? `Please answer: ${m.label || 'your reflection'}` : `Add a little more detail to: ${m.label || 'your reflection'}`)) }
  else if (confidence < EVAL.minConfidence) { decision = DECISION.INSUFFICIENT_INFORMATION; missingCriteria = [{ id: 'detail', reason: 'low-confidence' }]; feedback = ['There is not enough here for me to judge reliably. Add a few more sentences about what really happened.'] }
  else if (tooLong) { decision = DECISION.NEEDS_REVISION; feedback = [`Please keep it under ${EVAL.maxNarrativeChars} characters.`] }
  else if (duplicate) { decision = DECISION.REVIEW_REQUIRED; feedback = ['This looks almost the same as an earlier submission. Describe what was different this time.'] }
  else if (issues.length) { decision = DECISION.REVIEW_REQUIRED; missingCriteria = [{ id: 'consistency', reason: issues[0].id }]; feedback = [issues[0].message] }
  else if (noStart) { decision = DECISION.NEEDS_REVISION; missingCriteria = [{ id: 'actionSpecificity', reason: 'not-started' }]; feedback = ['It sounds like the task did not get started. Describe an actual attempt, or try again after beginning it.'] }
  else if (external && !base.criteria.relevance && dims.taskRelevance > 0) { decision = DECISION.REVIEW_REQUIRED; feedback = ['The external score suggests relevance, but the written evidence needs a human check against this Gate’s objective.'] }
  else if (disagreement > EVAL.maxDisagreement) { decision = DECISION.REVIEW_REQUIRED; feedback = ['Two evaluators disagreed about this answer, so it was not accepted automatically. Adding concrete detail usually settles it.'] }
  else if (dims.taskRelevance === 0 && (dims.actionSpecificity >= 50 || dims.reflectionQuality >= 50)) { decision = DECISION.REVIEW_REQUIRED; feedback = ['This is well written, but I could not connect it to this Gate. Say how it relates to what the Gate trains.'] }
  else if (q >= EVAL.acceptQuality && rubric.key.every((d) => dims[d] >= EVAL.keyFloor)) decision = DECISION.ACCEPTED
  else {
    decision = DECISION.NEEDS_REVISION
    const lacking = weak.length ? weak : DIMS.slice().sort((a, b) => dims[a] - dims[b]).slice(0, 1)
    missingCriteria = lacking.map((d) => ({ id: d, reason: 'weak' }))
    feedback = lacking.slice(0, 2).map((d) => DIM_HINT[d])
  }
  if (external?.feedback?.length && decision !== DECISION.ACCEPTED) feedback = [...feedback, ...external.feedback].slice(0, 3)

  const reasonCodes = []
  if (missing.length) reasonCodes.push('missing-required-fields')
  if (tooLong) reasonCodes.push('input-too-long')
  if (duplicate) reasonCodes.push('duplicate-submission')
  if (issues.some((issue) => issue.id === 'negation-conflict')) reasonCodes.push('explicit-contradiction')
  else if (issues.length) reasonCodes.push('consistency-issue')
  if (noStart) reasonCodes.push('explicit-non-start')
  if (base.confidence < EVAL.minConfidence) reasonCodes.push('low-confidence')

  const hardCheck = issues.some((issue) => issue.id === 'negation-conflict')
    ? 'contradiction'
    : issues.length ? 'consistency' : noStart ? 'non-start' : null
  const fastReject = Boolean(
    missing.length || tooLong || duplicate || issues.length || noStart || base.confidence < EVAL.minConfidence
    || decision === DECISION.INSUFFICIENT_INFORMATION,
  )
  const clearObjectiveEvidence = Boolean(
    base.criteria.relevance
    && (base.signals?.objectiveOverlap ?? 0) > 0
    && (base.signals?.actions ?? 0) > 0,
  )
  let classification
  let reason
  let providerEligible
  if (fastReject) {
    classification = 'FAST_PATH_REJECTABLE'
    reason = reasonCodes[0] || 'insufficient-evidence'
    providerEligible = false
  } else if (decision === DECISION.ACCEPTED && !external && clearObjectiveEvidence) {
    classification = 'FAST_PATH_ACCEPTABLE'
    reason = 'clear-objective-evidence'
    providerEligible = false
  } else {
    classification = 'SEMANTIC_REVIEW_REQUIRED'
    reason = !base.criteria.relevance || (base.signals?.objectiveOverlap ?? 0) === 0
      ? 'uncertain-objective-alignment'
      : (base.signals?.actions ?? 0) === 0
        ? 'uncertain-action-evidence'
        : 'ambiguous-evidence'
    providerEligible = hardCheck === null
  }
  if (classification === 'SEMANTIC_REVIEW_REQUIRED' && !reasonCodes.length) reasonCodes.push(reason)
  const routing = {
    classification,
    reason,
    reasonCodes: [...new Set(reasonCodes.length ? reasonCodes : [reason])],
    providerEligible,
    hardCheck,
  }

  return {
    decision, qualityScore: q, confidence, dimensions: dims, missingCriteria, feedback,
    evaluator: { ...used.evaluator, config: EVAL_FINGERPRINT }, fallback: Boolean(proposal && !external), protocolVersion: protocol.version,
    verification: 'self-reported', // text can show an account of an action, never prove it happened
    narrative, legacyCriteria: base.criteria, keys: base.keys, routing,
  }
}

/** Evidence record stored with an accepted stage; keeps the shape the Gate Mastery Protocol already reads. */
export const toEvidence = (r) => ({
  status: 'accepted', score: r.qualityScore / 100, criteria: r.legacyCriteria, feedback: [], keys: r.keys,
  quality: r.qualityScore, confidence: r.confidence, dimensions: r.dimensions, verification: r.verification,
  rubric: r.evaluator, protocolVersion: r.protocolVersion,
})

/** Reward policy: attribute development follows demonstrated quality (XP stays participation-based). */
export function scaleAttributes(attrs = {}, qualityScore) {
  return Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, v > 0 ? Math.max(1, Math.round((v * qualityScore) / 100)) : v]))
}

export const summarize = (r) => ({ decision: r.decision, qualityScore: r.qualityScore, confidence: r.confidence, dimensions: r.dimensions, missingCriteria: r.missingCriteria, feedback: r.feedback, evaluator: r.evaluator, verification: r.verification })
