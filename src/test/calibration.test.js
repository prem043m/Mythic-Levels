import { describe, it, expect } from 'vitest'
import { runCalibration } from '@/services/evaluation/calibrate'
import { DATASET, HELD_OUT } from './calibration/dataset'

describe('evaluator calibration (smoke set, implementer-labelled)', () => {
  const { results, metrics } = runCalibration(DATASET)
  it('reports metrics and stays above the regression floor', () => {
    console.log(JSON.stringify(metrics), results.filter((r) => !r.match).map((r) => `${r.id}:${r.decision}`).join(' '))
    expect(metrics.agreement).toBeGreaterThanOrEqual(0.95)
    expect(metrics.falseAcceptance).toBeLessThanOrEqual(0.05)
    expect(metrics.falseRejection).toBeLessThanOrEqual(0.05)
    expect(metrics.abstention).toBe(1)
    expect(metrics.paraphraseConsistency).toBe(1)
  })
  it('generalises acceptably to a held-out set written after tuning (known miss: keyword-only relevance, case H6)', () => {
    const held = runCalibration(HELD_OUT)
    console.log(JSON.stringify(held.metrics), held.results.filter((r) => !r.match).map((r) => `${r.id}:${r.decision}`).join(' '))
    expect(held.metrics.agreement).toBeGreaterThanOrEqual(0.8)
    expect(held.metrics.falseRejection).toBeLessThanOrEqual(0.1)
    expect(held.metrics.abstention).toBe(1)
  })
})
