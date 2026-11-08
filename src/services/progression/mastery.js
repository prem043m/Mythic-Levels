import { GMP } from '@/config/gmp'
import { DEFAULT_MASTERY_THRESHOLD } from '@/config/constants'
import { getGateById } from '@/data/catalog'
import { evaluateReflection } from '@/services/progression/reflection'
import { ritualResult, ritualSpec } from '@/services/progression/ritual'

const ZERO = { practice: 0, consistency: 0, reflection: 0, application: 0, finalTrial: 0 }
const pct = (x) => Math.round(x * 100)

function stageEvidence(gate, record) {
  const seen = []
  return gate.days.map((day) => {
    const rec = record.days[day.day]
    if (!rec?.completedAt) return null
    // Stored evidence wins (so revisions count); older saves are scored on the fly from their stored text.
    const ev = rec.evidence || evaluateReflection(rec.reflection, { gate, phase: day.phase, others: seen })
    seen.push(rec.reflection || '')
    return { day, rec, ev }
  })
}

/**
 * Pure and idempotent: decides, never awards. The engine applies a COMPLETED decision exactly once.
 * Mandatory conditions are listed with reasons; the weighted score is a second, separate gate.
 */
export function evaluateGateCompletion(state, gateId) {
  const gate = getGateById(gateId)
  const record = state.progress.gates[gateId]
  const threshold = state.settings.masteryThreshold ?? DEFAULT_MASTERY_THRESHOLD
  if (!gate || !record?.unlocked) {
    return { status: 'IN_PROGRESS', mastery: 0, threshold, signals: ZERO, checks: [], missing: [{ id: 'unlocked', text: 'This Gate is locked.' }], evidence: {} }
  }
  const n = gate.days.length
  const items = stageEvidence(gate, record).filter(Boolean)
  // Practice days = days with a stage, an accepted revision, or a finished ritual attempt (so older, rushed saves can still recover).
  const dates = [...items.flatMap((i) => [i.rec.completedDate, i.rec.revisedDate]), ...(record.ritual?.attempts || []).map((a) => a.finishedDate)]
  const distinct = new Set(dates.filter(Boolean)).size
  const minDays = Math.ceil(n / GMP.maxStagesPerDay)
  const accepted = items.filter((i) => i.ev.status === 'accepted').length
  const appOk = items.filter((i) => GMP.applicationPhases.includes(i.day.phase) && i.ev.status === 'accepted' && i.ev.criteria.application).length
  const ritual = ritualResult(record)

  const signals = {
    practice: items.length / n,
    consistency: Math.min(1, distinct / n),
    reflection: items.reduce((s, i) => s + i.ev.score, 0) / n,
    application: Math.min(1, appOk / GMP.applicationPhases.length),
    finalTrial: ritual.score,
  }
  const mastery = Object.keys(GMP.weights).reduce((s, k) => s + signals[k] * GMP.weights[k], 0)

  const checks = [
    { id: 'stages', ok: items.length === n, text: `Complete all ${n} stages (${items.length}/${n})` },
    { id: 'days', ok: distinct >= minDays, text: `Practise on at least ${minDays} different days (${distinct} so far)` },
    { id: 'reflections', ok: accepted >= GMP.minAcceptedReflections, text: `Have at least ${GMP.minAcceptedReflections} stage reflections accepted (${accepted}/${n})` },
    { id: 'application', ok: appOk >= GMP.minAcceptedApplication, text: `Show real-world action in at least ${GMP.minAcceptedApplication} of Resistance, Application and Challenge (${appOk} so far)` },
    { id: 'ritual', ok: ritual.done, text: `Complete the final ritual: ${ritualSpec(gate).name}` },
  ]
  const failed = checks.filter((c) => !c.ok)
  let status = 'COMPLETED'
  let missing = failed
  if (record.completedAt) missing = []
  else if (failed.length) status = 'IN_PROGRESS'
  else if (mastery + 1e-9 < threshold) {
    status = 'NEEDS_MORE_PRACTICE'
    missing = [{ id: 'mastery', ok: false, text: `Mastery is ${pct(mastery)}% and this Gate needs ${pct(threshold)}%. Strengthen your reflections or retry the ritual for a better result.` }]
  } else missing = []

  return {
    status, mastery, threshold, signals, checks, missing, alreadyCompleted: Boolean(record.completedAt),
    evidence: Object.fromEntries(items.map((i) => [i.day.day, i.ev])),
  }
}
