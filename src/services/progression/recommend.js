import { getGateByPosition } from '@/data/catalog'
import { evaluateGateCompletion } from '@/services/progression/mastery'
import { liveAttempt } from '@/services/progression/ritual'
import { HINTS, CRITERIA } from '@/services/progression/reflection'
import { GMP } from '@/config/gmp'
import { daysBetween, todayKey } from '@/utils/dates'

const LADDER = ['gentle', 'standard', 'austere']

/**
 * Deterministic, explainable next-practice recommendation. It only SUGGESTS: it never changes progression state,
 * never changes difficulty by itself, and every result carries a plain-language reason built from the player's own data.
 * Rules are ordered by "what unblocks the player most, most kindly"; the first match wins.
 */
export function recommendNextPractice(state, today = todayKey()) {
  const gate = getGateByPosition(state.player.currentArcana, state.player.currentGate)
  const record = state.progress.gates[gate.id] || { days: {} }
  const ev = evaluateGateCompletion(state, gate.id)
  const stage = gate.days.find((d) => !record.days[d.day]?.completedAt)
  const daily = state.settings.dailyDuration || 25
  const last = state.progress.streak.lastActiveDate
  const away = last ? daysBetween(last, today) : 0
  const recent = gate.days.map((d) => ({ d, e: ev.evidence[d.day] })).filter((x) => x.e && x.e.status !== 'none').slice(-3)
  const base = { gateId: gate.id, attribute: gate.relatedAttributes?.[0] || null, focus: null, difficultySuggestion: null }

  // Optional, never automatic: suggest a harder setting after three consistently strong reflections.
  const strong = recent.length === 3 && recent.every((x) => x.e.status === 'accepted' && x.e.score >= 0.8)
  const rung = LADDER.indexOf(state.settings.difficulty)
  if (strong && rung >= 0 && rung < LADDER.length - 1) {
    base.difficultySuggestion = { to: LADDER[rung + 1], reason: 'Your last three reflections were detailed and accepted. You may want a more demanding setting. This is only a suggestion; you decide in Settings.' }
  }

  if (away >= 3 && stage) {
    return { ...base, kind: 're-entry', title: `Return gently: ${stage.title}`, minutes: Math.min(10, daily), stageDay: stage.day,
      reason: `It has been ${away} days since your last practice. A short session rebuilds the habit; nothing you earned is lost.` }
  }
  const needsRevision = gate.days.map((d) => ({ d, e: ev.evidence[d.day] })).find((x) => x.e?.status === 'needs-revision')
  if (needsRevision) {
    return { ...base, kind: 'revise', title: `Strengthen your Day ${needsRevision.d.day} reflection`, minutes: 5, stageDay: needsRevision.d.day,
      reason: needsRevision.e.feedback[0] || 'This reflection needs one more detail to count as evidence.' }
  }
  if (!stage) {
    if (record.completedAt) return { ...base, kind: 'next-gate', title: 'Begin your next Gate', minutes: Math.min(15, daily), reason: 'This Gate is complete. A new one awaits.' }
    const resume = liveAttempt(record.ritual)
    return { ...base, kind: 'ritual', title: resume ? 'Resume the final ritual' : `Enter the final ritual: ${gate.bossTrial.title}`, minutes: gate.bossTrial.durationMinutes,
      reason: ev.status === 'NEEDS_MORE_PRACTICE' ? ev.missing[0].text : 'Every stage is complete. The ritual is the last requirement for this Gate.' }
  }
  if (gate.days.filter((d) => record.days[d.day]?.completedDate === today).length >= GMP.maxStagesPerDay) {
    return { ...base, kind: 'tomorrow', title: 'Rest, then continue tomorrow', minutes: 0, stageDay: stage.day,
      reason: `You have completed ${GMP.maxStagesPerDay} stages today, the daily limit that keeps a Gate from being rushed. The next stage is ready tomorrow.` }
  }
  // Next stage, tuned by the player's weakest recent criterion.
  let focus = null
  let reason = `Stage ${stage.day} (${stage.phase}) follows from the stages you have completed.`
  if (recent.length >= 2) {
    const rates = CRITERIA.map((c) => [c, recent.filter((x) => x.e.criteria[c]).length / recent.length]).sort((a, b) => a[1] - b[1])
    const [weak, rate] = rates[0]
    if (rate < 0.5) {
      focus = weak
      reason = `In ${recent.length - Math.round(rate * recent.length)} of your last ${recent.length} reflections, this was missing. Today, pay attention to it: ${HINTS[weak]}`
    }
  }
  return { ...base, kind: 'stage', title: `Day ${stage.day}: ${stage.title}`, minutes: Math.min(stage.durationMinutes, daily), stageDay: stage.day, focus, reason,
    attribute: Object.keys(stage.attributes || {})[0] || base.attribute }
}
