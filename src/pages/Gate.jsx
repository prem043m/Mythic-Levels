import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { getGateById } from '@/data/catalog'
import { GMP } from '@/config/gmp'
import { todayKey } from '@/utils/dates'
import { getGateMastery } from '@/services/progression/engine'
import { ritualSpec, ritualResult, liveAttempt } from '@/services/progression/ritual'
import Ceremony from '@/components/Ceremony'
import Emblem from '@/components/Emblem'
import RubricLive from '@/components/RubricLive'
import { Panel, H, Btn, Bar } from '@/components/ui'
import { ROUTES } from '@/config/routes'

const ERR = {
  'stage-locked': 'Finish the previous stage first.',
  'daily-stage-limit': `You have already completed ${GMP.maxStagesPerDay} stages today. The next one opens tomorrow.`,
  'locked-gate': 'This Gate is still locked.',
}
const DIM = [['practice', 'Practice'], ['consistency', 'Consistency'], ['reflection', 'Reflection'], ['application', 'Application'], ['finalTrial', 'Final ritual']]
const BADGE = { accepted: ['Evidence accepted', 'text-cosmic'], 'needs-revision': ['Needs revision', 'text-ember'], none: ['No reflection', 'text-muted'] }

function Stage({ gate, day, rec, ev, available, limitReached }) {
  const { complete, revise } = useGameStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [err, setErr] = useState(null)
  const entry = rec.days[day.day]
  const done = Boolean(entry?.completedAt)
  const others = gate.days.filter((d) => d.day !== day.day).map((d) => rec.days[d.day]?.reflection || '')
  const submit = () => {
    const res = complete(gate.id, day.id, text, day.durationMinutes)
    if (!res.ok) setErr(ERR[res.error] || 'Could not complete this stage.'); else { setOpen(false); setText('') }
  }
  const resubmit = () => { const res = revise(gate.id, day.day, text); if (res.ok) setText(''); else setErr('Could not save the revision.') }
  const badge = ev && BADGE[ev.status]
  return (
    <li className="relative">
      <span aria-hidden="true" className={`absolute -left-[34px] top-1 grid h-6 w-6 place-items-center rounded-full border bg-obsidian text-xs ${done ? 'border-ancient text-ancient' : available ? 'border-cosmic text-cosmic accent-glow' : 'border-white/20 text-muted'}`}>{done ? '✓' : available ? '◉' : '○'}</span>
      <div className={`rounded-lg border p-4 ${available ? 'border-cosmic/50 bg-white/[0.03]' : done ? 'border-ancient/30' : 'border-white/10 opacity-60'}`}>
        <div className="flex justify-between gap-3">
          <h3 className="font-display">Stage {day.day} · {day.title}</h3>
          <span className="text-xs text-muted shrink-0 capitalize">{day.phase === 'trial' ? 'integration' : day.phase}</span>
        </div>
        {done && badge && <p className={`text-xs mt-1 ${badge[1]}`}>{badge[0]}</p>}
        {done && ev?.status === 'needs-revision' && (
          <div className="mt-2 space-y-2">
            <ul className="text-sm text-muted list-disc pl-5">{ev.feedback.map((f) => <li key={f}>{f}</li>)}</ul>
            <textarea aria-label="Revise reflection" className="w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 p-2" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
            <RubricLive text={text} gate={gate} phase={day.phase} others={others} />
            <Btn variant="ghost" disabled={!text.trim()} onClick={resubmit}>Save revision</Btn>
          </div>
        )}
        {available && !done && (
          <>
            <p className="text-sm text-muted mt-1">{day.objective}</p>
            {limitReached ? <p className="text-sm text-cosmic mt-2">Rest now. The next stage opens tomorrow.</p>
              : !open ? <Btn className="mt-3" onClick={() => setOpen(true)}>Begin · ~{day.durationMinutes} min</Btn> : (
                <div className="mt-3 space-y-3">
                  <p>{day.task}</p>
                  {day.explanation && <p className="text-sm text-muted">{day.explanation}</p>}
                  <label className="block text-sm">{day.prompt || 'What did this reveal?'}
                    <textarea className="mt-1 w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 p-2" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
                  </label>
                  <RubricLive text={text} gate={gate} phase={day.phase} others={others} />
                  <p className="text-xs text-muted">Confirm only once you have really done it. The reflection can be improved later.</p>
                  {err && <p role="alert" className="text-ember text-sm">{err}</p>}
                  <div className="flex gap-2"><Btn onClick={submit}>I did it — seal this stage</Btn><Btn variant="ghost" onClick={() => setOpen(false)}>Not yet</Btn></div>
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
        <Emblem symbol={gate.symbol} value={mastery} size={104} label={`Mastery ${Math.round(mastery * 100)} percent`} />
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
