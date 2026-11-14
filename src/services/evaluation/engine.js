import { EVAL } from '@/config/evaluation'
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

/** Baseline evaluator: deterministic, explainable, offline. Judges structure and Gate vocabulary, never truth. */
export function ruleBasedEvaluator({ gate, day, fields, narrative, others, legacy = false }) {
  const ev = evaluateReflection(narrative, { gate, phase: day.phase, others })
  const c = ev.criteria
  const has = (id, n = 4) => distinct(fields[id] || '') >= n // a guided field answered with real content
  const action = c.application || has('action')
  const situation = c.specificity || has('situation')
  const dimensions = {
    actionSpecificity: (action ? 50 : 0) + (situation ? 50 : 0),
    taskRelevance: (ev.signals?.unique ?? 0) >= 4 ? Math.min(100, (ev.signals?.overlap ?? 0) * 50) : 0,
    difficultyAwareness: c.awareness || has('difficulty') ? 100 : 0,
    // A dedicated reflection answer earns partial credit; in single-text mode the whole text is not a reflection answer.
    reflectionQuality: c.learning ? 100 : !legacy && has('reflection', 6) ? 50 : 0,
  }
  const unique = ev.signals?.unique ?? 0
  const volume = Math.min(1, unique / EVAL.fullConfidenceTokens)
  const spread = Math.max(...Object.values(dimensions)) - Math.min(...Object.values(dimensions))
  // Confidence = how much the evaluator has to go on (volume), slightly reduced when its own signals disagree.
  const confidence = Math.round((0.3 + 0.7 * volume) * (spread >= 100 ? 0.9 : 1) * 100) / 100
  return { dimensions, confidence, criteria: c, keys: ev.keys, evaluator: { name: 'rule-based', version: EVAL.rubricVersion } }
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
  const tooLong = narrative.length > EVAL.maxNarrativeChars

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

  return {
    decision, qualityScore: q, confidence, dimensions: dims, missingCriteria, feedback,
    evaluator: used.evaluator, fallback: Boolean(proposal && !external), protocolVersion: protocol.version,
    verification: 'self-reported', // text can show an account of an action, never prove it happened
    narrative, legacyCriteria: base.criteria, keys: base.keys,
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
