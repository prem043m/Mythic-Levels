import { getGateByPosition } from '@/data/catalog'
import { GMP } from '@/config/gmp'
import { EVAL } from '@/config/evaluation'
import { evaluateGateCompletion } from '@/services/progression/mastery'
import { liveAttempt } from '@/services/progression/ritual'
import { HINTS, CRITERIA } from '@/services/progression/reflection'
import { daysBetween, todayKey } from '@/utils/dates'

const LADDER = ['gentle', 'standard', 'austere']
const r2 = (x) => Math.round(x * 100) / 100

/**
 * Bounded, stateless difficulty adaptation from the last `window` stage observations ({attempts, quality}).
 * One result never moves it (needs `window` in a row). +1 (stretch) is only ever a SUGGESTION; -1 (support) applies automatically.
 */
export function adaptDifficulty(observations) {
  const { window, strongQuality, weakQuality } = EVAL.difficulty
  const recent = observations.slice(-window)
  if (recent.length < window) return { offset: 0 }
  if (recent.every((o) => o.attempts <= 1 && o.quality >= strongQuality)) return { offset: 1 }
  if (recent.every((o) => o.attempts >= 2 || o.quality < weakQuality)) return { offset: -1 }
  return { offset: 0 }
}

/**
 * Candidate selection: (1) build candidates the player can actually execute, (2) drop those that violate hard constraints,
 * (3) score the rest with normalized terms and configurable weights, (4) pick the best, deterministically.
 * It only SUGGESTS; progression state is never touched.
 */
export function rankCandidates(state, today = todayKey()) {
  const gate = getGateByPosition(state.player.currentArcana, state.player.currentGate)
  const record = state.progress.gates[gate.id] || { days: {} }
  const ev = evaluateGateCompletion(state, gate.id)
  const stage = gate.days.find((d) => !record.days[d.day]?.completedAt)
  const daily = state.settings.dailyDuration || 25
  const last = state.progress.streak.lastActiveDate
  const away = last ? daysBetween(last, today) : 0
  const done = gate.days.filter((d) => record.days[d.day]?.completedAt)
  const observations = done.map((d) => ({ attempts: record.days[d.day].attempts || 1, quality: record.days[d.day].evidence?.quality ?? Math.round((record.days[d.day].evidence?.score || 0) * 100) }))
  const adapt = adaptDifficulty(observations)
  const draft = stage ? record.drafts?.[stage.day] : null
  const todayCount = done.filter((d) => record.days[d.day].completedDate === today).length
  const legacy = gate.days.map((d) => ({ d, e: ev.evidence[d.day] })).find((x) => x.e?.status === 'needs-revision' && !x.e.quality)
  const needsRecovery = away >= 3 || adapt.offset < 0 || (draft?.attempts || 0) >= 2
  const playerOffset = Math.min(adapt.offset, 0) // a stretch is never applied automatically
  const recent = done.slice(-3).map((d) => ({ d, e: ev.evidence[d.day] })).filter((x) => x.e && x.e.status !== 'none')
  const base = { gateId: gate.id, attribute: gate.relatedAttributes?.[0] || null, focus: null }
  const out = []

  if (record.completedAt) {
    out.push({ ...base, id: 'next', kind: 'next-gate', title: 'Begin your next Gate', minutes: Math.min(15, daily), baseMinutes: 15, difficulty: 0, need: 1, gentle: false, reason: 'This Gate is complete. A new one awaits.' })
  } else if (!stage) {
    const resume = liveAttempt(record.ritual)
    out.push({ ...base, id: 'ritual', kind: 'ritual', title: resume ? 'Resume the final ritual' : `Enter the final ritual: ${gate.bossTrial.title}`, minutes: gate.bossTrial.durationMinutes, baseMinutes: gate.bossTrial.durationMinutes, difficulty: 0, need: 1, gentle: false,
      reason: ev.status === 'NEEDS_MORE_PRACTICE' ? ev.missing[0].text : 'Every stage is complete. The ritual is the last requirement for this Gate.' })
  } else if (todayCount >= GMP.maxStagesPerDay) {
    out.push({ ...base, id: 'rest', kind: 'tomorrow', title: 'Rest, then continue tomorrow', minutes: 0, baseMinutes: 0, stageDay: stage.day, difficulty: 0, need: 0.2, gentle: false,
      reason: `You have completed ${GMP.maxStagesPerDay} stages today, the daily limit that keeps a Gate from being rushed. The next stage is ready tomorrow.` })
  } else {
    const full = Math.min(stage.durationMinutes, daily)
    let focus = null
    let reason = `Stage ${stage.day} (${stage.phase}) follows from the stages you have completed.`
    if (recent.length >= 2) {
      const [weak, rate] = CRITERIA.map((c) => [c, recent.filter((x) => x.e.criteria?.[c]).length / recent.length]).sort((a, b) => a[1] - b[1])[0]
      if (rate < 0.5) { focus = weak; reason = `In ${recent.length - Math.round(rate * recent.length)} of your last ${recent.length} reflections, this was missing. Today, pay attention to it: ${HINTS[weak]}` }
    }
    if (draft) reason = `Your last attempt needs one more thing: ${draft.evaluation.feedback[0] || 'a little more detail.'}`
    const attribute = Object.keys(stage.attributes || {})[0] || base.attribute
    out.push({ ...base, id: 'stage', kind: 'stage', title: `Day ${stage.day}: ${stage.title}`, minutes: full, baseMinutes: full, stageDay: stage.day, difficulty: 0, need: 1, gentle: false, context: draft ? 'resubmit' : 'new', focus, reason, attribute })
    if (needsRecovery) {
      const returning = away >= 3
      const lite = returning ? Math.min(10, daily) : Math.max(EVAL.difficulty.minScaffoldMinutes, Math.ceil(full * EVAL.difficulty.scaffoldFactor))
      out.push({ ...base, id: 'gentle', kind: returning ? 're-entry' : 'stage', scaffold: !returning, title: returning ? `Return gently: ${stage.title}` : `A lighter start: ${stage.title}`, minutes: lite, baseMinutes: lite, stageDay: stage.day, difficulty: -1, need: 0.8, gentle: true, context: draft ? 'resubmit' : 'new', attribute,
        reason: returning ? `It has been ${away} days since your last practice. A short session rebuilds the habit; nothing you earned is lost.` : 'Your recent submissions needed extra work, so today’s session is shorter. Do less, but do it for real, then build back up.' })
    }
  }
  if (legacy && !record.completedAt) {
    out.push({ ...base, id: 'revise', kind: 'revise', title: `Strengthen your Day ${legacy.d.day} reflection`, minutes: 5, baseMinutes: 5, stageDay: legacy.d.day, difficulty: 0, need: 0.8, gentle: false, reason: legacy.e.feedback?.[0] || 'This reflection needs one more detail to count as evidence.' })
  }

  const W = EVAL.ranking
  const ranked = out.map((c) => {
    const parts = {
      gate: 1,
      need: c.need,
      fit: 1 - Math.abs(c.difficulty - playerOffset) / 2,
      time: c.baseMinutes > 0 ? Math.min(1, daily / c.baseMinutes) : 1,
      recovery: needsRecovery ? (c.gentle ? 1 : 0) : (c.gentle ? 0.6 : 1),
    }
    return { ...c, parts, score: Object.keys(W).reduce((s, k) => s + W[k] * parts[k], 0) }
  }).sort((a, b) => b.score - a.score)
  return { ranked, adapt, rung: LADDER.indexOf(state.settings.difficulty) }
}

export function recommendNextPractice(state, today = todayKey()) {
  const { ranked, adapt, rung } = rankCandidates(state, today)
  const top = ranked[0]
  const difficultySuggestion = adapt.offset > 0 && rung >= 0 && rung < LADDER.length - 1
    ? { to: LADDER[rung + 1], reason: 'Your last stages were accepted on the first try with high quality. You may want a more demanding setting. This is only a suggestion; you decide in Settings.' }
    : null
  const { id, parts, score, baseMinutes, need, gentle, difficulty, ...rest } = top
  return { ...rest, difficultySuggestion, offset: adapt.offset, ranking: ranked.map((c) => ({ id: c.id, kind: c.kind, score: r2(c.score), parts: c.parts })) }
}
