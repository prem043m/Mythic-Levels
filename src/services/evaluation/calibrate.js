import { getGateById } from '@/data/catalog'
import { evaluateSubmission } from '@/services/evaluation/engine'

/** Runs a labelled dataset through the evaluator and reports the metrics the spec asks for. */
export function runCalibration(dataset, evaluate = evaluateSubmission) {
  const results = dataset.map((e) => {
    const gate = getGateById(e.gateId)
    const day = gate.days.find((d) => d.phase === e.phase)
    const legacy = typeof e.input === 'string'
    const r = evaluate({ gate, day, fields: legacy ? { reflection: e.input } : e.input, legacy, others: e.others || [] })
    return { ...e, decision: r.decision, quality: r.qualityScore, confidence: r.confidence, match: e.expected.includes(r.decision) }
  })
  const scored = results.filter((r) => !r.knownLimit)
  const shouldAccept = scored.filter((r) => r.expected.length === 1 && r.expected[0] === 'ACCEPTED')
  const shouldNot = scored.filter((r) => !r.expected.includes('ACCEPTED'))
  const abstain = scored.filter((r) => r.category === 'very-short' || r.category === 'missing-field')
  const groups = {}
  for (const r of scored) if (r.group) (groups[r.group] ||= []).push(r.decision)
  return {
    results,
    metrics: {
      n: scored.length,
      agreement: scored.filter((r) => r.match).length / scored.length,
      falseAcceptance: shouldNot.filter((r) => r.decision === 'ACCEPTED').length / shouldNot.length,
      falseRejection: shouldAccept.filter((r) => r.decision !== 'ACCEPTED').length / shouldAccept.length,
      abstention: abstain.filter((r) => r.decision === 'INSUFFICIENT_INFORMATION').length / abstain.length,
      paraphraseConsistency: Object.values(groups).filter((g) => g.every((d) => d === g[0])).length / Object.values(groups).length,
    },
  }
}
