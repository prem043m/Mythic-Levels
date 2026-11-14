import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { getGateById } from '@/data/catalog'
import { GMP } from '@/config/gmp'
import { todayKey } from '@/utils/dates'
import { getGateMastery } from '@/services/progression/engine'
import { ritualSpec, ritualResult, liveAttempt } from '@/services/progression/ritual'
import Ceremony from '@/components/Ceremony'
import Emblem from '@/components/Emblem'
import { GateEmblem } from '@/components/ProgressionIdentity'
import RubricLive from '@/components/RubricLive'
import { protocolFor, narrativeOf } from '@/services/evaluation/protocol'
import { Panel, H, Btn, Bar } from '@/components/ui'
import { ROUTES } from '@/config/routes'

const ERR = {
  'stage-locked': 'Finish the previous stage first.',
  'daily-stage-limit': `You have already completed ${GMP.maxStagesPerDay} stages today. The next one opens tomorrow.`,
  'locked-gate': 'This Gate is still locked.',
}
const DIM = [['practice', 'Practice'], ['consistency', 'Consistency'], ['reflection', 'Reflection'], ['application', 'Application'], ['finalTrial', 'Final ritual']]
const BADGE = { accepted: ['Evidence accepted', 'text-cosmic'], 'needs-revision': ['Needs revision', 'text-ember'], none: ['No reflection', 'text-muted'] }

const VERDICT = {
  NEEDS_REVISION: 'Almost there. This needs a little more.',
  INSUFFICIENT_INFORMATION: 'More detail needed before this can be assessed.',
  REVIEW_REQUIRED: 'This could not be checked automatically.',
}
const EVAL_DIMS = [['actionSpecificity', 'Action'], ['taskRelevance', 'Relevance'], ['difficultyAwareness', 'Difficulty'], ['reflectionQuality', 'Reflection']]

// Quality and confidence are separate: how good the account is, and how sure the evaluator is about judging it.
function Verdict({ v, attempts }) {
  if (!v) return null
  return (
    <div role="status" className="rounded-lg border border-ember/40 bg-ember/5 p-3 space-y-2">
      <p className="text-sm font-semibold text-ember">{VERDICT[v.decision] || 'Not accepted yet.'}{attempts > 1 ? ` (attempt ${attempts})` : ''}</p>
      <ul className="text-sm list-disc pl-5">{v.feedback.map((f) => <li key={f}>{f}</li>)}</ul>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
        {EVAL_DIMS.map(([k, label]) => <div key={k} className="flex justify-between"><dt>{label}</dt><dd>{v.dimensions[k]}/100</dd></div>)}
      </dl>
      <p className="text-xs text-muted">Quality {v.qualityScore}/100 · evaluator confidence {Math.round(v.confidence * 100)}%. This measures how well you described what you did, not whether it happened. Nothing is lost: revise and try again.</p>
    </div>
  )
}

function Stage({ gate, day, rec, ev, available, limitReached }) {
  const { complete, revise } = useGameStore()
  const protocol = useMemo(() => protocolFor(day), [day])
  const draft = rec.drafts?.[day.day]
  const [open, setOpen] = useState(Boolean(draft))
  const [fields, setFields] = useState(draft?.fields || {})
  const [verdict, setVerdict] = useState(draft?.evaluation || null)
  const [attempts, setAttempts] = useState(draft?.attempts || 0)
  const [text, setText] = useState('')
  const [err, setErr] = useState(null)
  const entry = rec.days[day.day]
  const done = Boolean(entry?.completedAt)
  const others = gate.days.filter((d) => d.day !== day.day).map((d) => rec.days[d.day]?.reflection || '')
  const narrative = narrativeOf(fields)
  const setField = (id, v) => setFields((p) => ({ ...p, [id]: v }))
  const submit = () => {
    setErr(null)
    const res = complete(gate.id, day.id, { submission: fields }, day.durationMinutes)
    if (res.ok) { setOpen(false); setVerdict(null); return }
    if (res.error === 'not-accepted') { setVerdict(res.evaluation); setAttempts((n) => n + 1) } else setErr(ERR[res.error] || 'Could not complete this stage.')
  }
  const improve = () => {
    setErr(null)
    const res = revise(gate.id, day.day, text)
    if (res.ok) { setText(''); setVerdict(null) } else if (res.error === 'not-accepted') setVerdict(res.evaluation); else setErr('Could not save the revision.')
  }
  const badge = ev && BADGE[ev.status]
  return (
    <li className="relative">
      <span aria-hidden="true" className={`absolute -left-[34px] top-1 grid h-6 w-6 place-items-center rounded-full border bg-obsidian text-xs ${done ? 'border-ancient text-ancient' : available ? 'border-cosmic text-cosmic accent-glow' : 'border-white/20 text-muted'}`}>{done ? '✓' : available ? '◉' : '○'}</span>
      <div className={`rounded-lg border p-4 ${available ? 'border-cosmic/50 bg-white/[0.03]' : done ? 'border-ancient/30' : 'border-white/10 opacity-60'}`}>
        <div className="flex justify-between gap-3">
          <h3 className="font-display">Stage {day.day} · {day.title}</h3>
          <span className="text-xs text-muted shrink-0 capitalize">{day.phase === 'trial' ? 'integration' : day.phase}</span>
        </div>
        {done && badge && <p className={`text-xs mt-1 ${badge[1]}`}>{badge[0]}{ev.quality != null ? ` · quality ${ev.quality}` : ''}{ev.verification ? ' · self-reported' : ''}</p>}
        {done && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-muted">{ev?.status === 'needs-revision' ? 'Strengthen this reflection' : 'Improve this reflection'}</summary>
            <div className="mt-2 space-y-2">
              {ev?.status === 'needs-revision' && <ul className="text-muted list-disc pl-5">{ev.feedback.map((f) => <li key={f}>{f}</li>)}</ul>}
              <textarea aria-label="Revised reflection" className="w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 p-2" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
              <RubricLive text={text} gate={gate} phase={day.phase} others={others} />
              <Verdict v={verdict} attempts={0} />
              {err && <p role="alert" className="text-ember">{err}</p>}
              <Btn variant="ghost" disabled={!text.trim()} onClick={improve}>Save revision</Btn>
            </div>
          </details>
        )}
        {available && !done && (
          <>
            <p className="text-sm text-muted mt-1">{day.objective}</p>
            {limitReached ? <p className="text-sm text-cosmic mt-2">Rest now. The next stage opens tomorrow.</p>
              : !open ? <Btn className="mt-3" onClick={() => setOpen(true)}>Begin · ~{day.durationMinutes} min</Btn> : (
                <div className="mt-3 space-y-3">
                  <p>{day.task}</p>
                  {day.explanation && <p className="text-sm text-muted">{day.explanation}</p>}
                  {protocol.fields.map((f) => (
                    <label key={f.id} className="block text-sm">
                      {f.label}{f.required ? <span className="text-ember" aria-label="required"> *</span> : <span className="text-muted"> (optional)</span>}
                      <span className="block text-xs text-muted">{f.hint}</span>
                      <textarea className="mt-1 w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 p-2" rows={2} value={fields[f.id] || ''} onChange={(e) => setField(f.id, e.target.value)} />
                    </label>
                  ))}
                  <RubricLive text={narrative} gate={gate} phase={day.phase} others={others} />
                  <Verdict v={verdict} attempts={attempts} />
                  <p className="text-xs text-muted">Confirm only once you have really done it. Your account is self-reported: it is checked for clarity and detail, not proven.</p>
                  {err && <p role="alert" className="text-ember text-sm">{err}</p>}
                  <div className="flex gap-2"><Btn onClick={submit} disabled={!narrative.trim()}>I did it — check and seal this stage</Btn><Btn variant="ghost" onClick={() => setOpen(false)}>Not yet</Btn></div>
                </div>
              )}
          </>
        )}
      </div>
    </li>
  )
}

export default function Gate() {
  const { gateId } = useParams()
  const { game, lastResult, clearResult, enter } = useGameStore()
  const gate = getGateById(gateId)
  const rec = game.progress.gates[gateId]
  if (!gate) return <Navigate to={ROUTES.journey} replace />
  if (!rec?.unlocked) return <Panel><p>This Gate is locked. Complete the previous Gate first.</p><Link className="underline text-cosmic" to={ROUTES.journey}>Back to the World Tree</Link></Panel>

  const { mastery, signals, evaluation } = getGateMastery(game, gateId)
  const spec = ritualSpec(gate)
  const ritual = ritualResult(rec)
  const stagesDone = gate.days.every((d) => rec.days[d.day]?.completedAt)
  const firstOpen = gate.days.find((d) => !rec.days[d.day]?.completedAt)
  const todayCount = gate.days.filter((d) => rec.days[d.day]?.completedDate === todayKey()).length
  const isCurrent = game.player.currentArcana === gate.arcana && game.player.currentGate === gate.gateNumber
  const resume = liveAttempt(rec.ritual)
  const status = { COMPLETED: 'Gate mastered', IN_PROGRESS: 'In progress', NEEDS_MORE_PRACTICE: 'Needs more practice' }[evaluation.status]

  return (
    <div className="space-y-4">
      {lastResult && <Ceremony r={lastResult} onClose={clearResult} />}
      <Panel className={`ornate accent-${gate.arcana} accent-edge accent-glow flex gap-5 items-center`}>
        <Emblem symbol={gate.symbol} value={mastery} size={104} label={`Mastery ${Math.round(mastery * 100)} percent`}>
          <GateEmblem gate={gate} size="chamber" state={isCurrent ? 'active' : evaluation.status === 'COMPLETED' ? 'mastered' : 'available'} />
        </Emblem>
        <div className="min-w-0">
          <p className="engraved text-xs accent-text">{gate.arcana} · Gate {gate.gateNumber} · {gate.archetype}</p>
          <h1 className="font-display text-3xl text-ancient">{gate.name}</h1>
          <p className="italic text-muted">{gate.principle}</p>
          <p className="text-sm mt-1">{status} · mastery {Math.round(mastery * 100)}% of {Math.round(evaluation.threshold * 100)}% needed</p>
        </div>
      </Panel>
      <Panel>
        <p className="text-sm">{gate.lore}</p>
        <details className="mt-3 text-sm text-muted"><summary className="cursor-pointer text-ink">Philosophy &amp; intended outcome</summary><p className="mt-2">{gate.philosophy}</p><p className="mt-2">{gate.outcome}</p></details>
        {!isCurrent && !rec.completedAt && <Btn variant="ghost" className="mt-3" onClick={() => enter(gateId)}>Make this my current Gate</Btn>}
      </Panel>

      <Panel>
        <H>What this Gate requires</H>
        <ul className="space-y-1 text-sm">
          {evaluation.checks.map((c) => <li key={c.id} className={c.ok ? 'text-cosmic' : 'text-muted'}><span aria-hidden="true">{c.ok ? '✓' : '○'} </span>{c.text}</li>)}
        </ul>
        <dl className="mt-4 space-y-2">
          {DIM.map(([k, label]) => (
            <div key={k}><div className="flex justify-between text-xs text-muted"><dt>{label} · weight {Math.round(GMP.weights[k] * 100)}%</dt><dd>{Math.round(signals[k] * 100)}%</dd></div><Bar label={label} value={signals[k]} /></div>
          ))}
        </dl>
        {evaluation.status === 'NEEDS_MORE_PRACTICE' && <p className="text-sm text-ember mt-3">{evaluation.missing[0]?.text}</p>}
        <p className="text-xs text-muted mt-3">Mastery is evidence of practice and reflection that you recorded. It cannot measure who you have become; you remain the judge of that.</p>
      </Panel>

      <ol className="relative ml-3 border-l border-white/15 space-y-4 pl-6" aria-label="Stages">
        {gate.days.map((d) => (
          <Stage key={d.id} gate={gate} day={d} rec={rec} ev={evaluation.evidence[d.day]} available={d.day === firstOpen?.day} limitReached={todayCount >= GMP.maxStagesPerDay} />
        ))}
        <li className="relative">
          <span aria-hidden="true" className={`absolute -left-[34px] top-1 grid h-6 w-6 place-items-center rounded-full border bg-obsidian text-xs ${ritual.done ? 'border-ancient text-ancient' : stagesDone ? 'border-ember text-ember accent-glow' : 'border-white/20 text-muted'}`}>✦</span>
          <div className={`ornate rounded-lg border p-5 ${stagesDone ? 'border-ember/50 bg-ember/5' : 'border-white/10 opacity-60'}`}>
            <h3 className="font-display text-xl text-ancient">Final ritual · {spec.name}</h3>
            <p className="text-sm text-muted mt-1">{spec.objective}</p>
            <p className="text-xs text-muted mt-2">A sustained sitting of about {spec.targetMinutes} minutes (at least {spec.minMinutes} counted), with preparation, an observation record, a reflection and a self-assessment.</p>
            {ritual.done && !rec.completedAt && evaluation.status === 'NEEDS_MORE_PRACTICE' && <p className="text-sm text-ember mt-2">You may attempt the ritual again to improve your result.</p>}
            {stagesDone && !rec.completedAt && (
              <Link to={`/ritual/${gate.id}`} className="inline-block mt-3 rounded-lg bg-gradient-to-b from-[#e0c383] to-ancient px-5 py-2 font-semibold text-void">
                {resume ? 'Resume the ritual' : ritual.done ? 'Attempt again' : 'Enter the ritual'}
              </Link>
            )}
            {!stagesDone && <p className="text-xs mt-2 text-muted">Opens after all {gate.days.length} stages.</p>}
            {rec.completedAt && <p className="text-ancient mt-2">Completed · title earned: {gate.titleReward}</p>}
          </div>
        </li>
      </ol>
    </div>
  )
}
