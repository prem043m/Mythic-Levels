import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { getGateById } from '@/data/catalog'
import { ritualSpec, liveAttempt, activeMs } from '@/services/progression/ritual'
import RubricLive from '@/components/RubricLive'
import { Ring, Btn } from '@/components/ui'
import { ROUTES } from '@/config/routes'

const ERR = {
  'too-short': (r) => `You have ${r.minutes} of the ${r.needed} active minutes this ritual needs. Keep going; nothing is lost.`,
  'observation-missing': () => 'Record what pulled you away, or confirm that nothing did.',
  'outcome-missing': () => 'Say whether you achieved the objective: yes, partly or no. An honest “no” is welcome.',
  'self-assessment-missing': () => 'Rate how well you held to your intention, from 1 to 5.',
  'reflection-needs-revision': (r) => `Your reflection needs more detail: ${r.feedback?.[0] || ''}`,
  'intention-missing': () => 'Name your task and your intention.',
  'preparation-incomplete': () => 'Confirm every preparation step before you begin.',
}
const field = 'w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2 text-ink'
const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`

export default function Ritual() {
  const { gateId } = useParams()
  const { game, ritual } = useGameStore()
  const nav = useNavigate()
  const [now, setNow] = useState(Date.now())
  const [f, setF] = useState({ task: '', intention: '', checked: [], note: '', outcome: '', none: false, rating: 0, reflection: '' })
  const [msg, setMsg] = useState(null)
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  const gate = getGateById(gateId)
  const rec = game.progress.gates[gateId]
  if (!gate || !rec?.unlocked) return <Navigate to={ROUTES.journey} replace />
  const spec = ritualSpec(gate)
  const stagesDone = gate.days.every((d) => rec.days[d.day]?.completedAt)
  const attempt = liveAttempt(rec.ritual)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const run = (action, payload) => {
    const r = ritual(gateId, action, payload)
    if (!r.ok) setMsg((ERR[r.error] || (() => 'That could not be done right now.'))(r)); else setMsg(null)
    return r
  }
  const ms = attempt ? activeMs(attempt, now) : 0
  const others = Object.values(rec.days).map((d) => d.reflection || '')
  const finish = () => {
    const r = run('finish', { outcome: f.outcome, noInterruptions: f.none, selfRating: f.rating, reflection: f.reflection })
    if (r.ok) nav(`/gate/${gateId}`)
  }

  return (
    <div className="ritual-bg fixed inset-0 z-50 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-5 py-8">
        <Link to={`/gate/${gateId}`} className="text-sm text-muted underline">← Leave (your progress is saved)</Link>
        <header className="text-center mt-6 mb-8">
          <div className="text-5xl text-ancient ritual-glow" aria-hidden="true">{gate.symbol}</div>
          <p className="engraved text-xs text-muted mt-3">Final ritual · {gate.name}</p>
          <h1 className="title-shimmer font-display text-4xl mt-1">{spec.name}</h1>
          <p className="text-muted mt-3 text-balance">{spec.objective}</p>
        </header>

        {!stagesDone && <p className="panel rounded-xl p-5 text-center">Complete all {gate.days.length} stages before the ritual.</p>}

        {stagesDone && !attempt && (
          <section className="panel ornate rounded-xl p-6 space-y-4" aria-label="Preparation">
            <h2 className="font-display text-ancient">I · Preparation</h2>
            {spec.preparation.map((p, i) => (
              <label key={p} className="flex gap-3 items-start"><input type="checkbox" className="mt-1" checked={f.checked.includes(i)} onChange={() => set('checked', f.checked.includes(i) ? f.checked.filter((x) => x !== i) : [...f.checked, i])} /><span>{p}</span></label>
            ))}
            <label className="block">The task or situation I will use<input className={field} maxLength={120} value={f.task} onChange={(e) => set('task', e.target.value)} /></label>
            <label className="block">My intention<input className={field} maxLength={120} value={f.intention} onChange={(e) => set('intention', e.target.value)} /></label>
            {msg && <p role="alert" className="text-ember text-sm">{msg}</p>}
            <Btn onClick={() => run('prepare', { task: f.task, intention: f.intention, checked: f.checked.length })}>Seal my intention</Btn>
          </section>
        )}

        {attempt?.status === 'preparing' && (
          <section className="panel ornate rounded-xl p-6 text-center space-y-3" aria-label="Ready">
            <p>Task: <b>{attempt.task}</b></p><p className="text-muted">Intention: {attempt.intention}</p>
            <p className="text-sm text-muted">The sitting counts only the minutes you are actively in it. At least {spec.minMinutes} are needed.</p>
            <div className="flex justify-center gap-2"><Btn onClick={() => run('start', {})}>Begin the sitting</Btn><Btn variant="ghost" onClick={() => confirm('Set this attempt aside?') && run('abandon', {})}>Set aside</Btn></div>
          </section>
        )}

        {(attempt?.status === 'active' || attempt?.status === 'paused') && (
          <>
            <section className="flex flex-col items-center gap-4" aria-label="The sitting">
              <Ring size={190} value={ms / (spec.targetMinutes * 60000)} label={`Active time ${mmss(ms)}`}>
                <span className="text-center"><span className="font-display text-4xl text-ancient block" aria-live="off">{mmss(ms)}</span><span className="text-xs text-muted">of {spec.targetMinutes} min · min {spec.minMinutes}</span></span>
              </Ring>
              <p className="text-muted">{attempt.status === 'active' ? 'You are in the sitting.' : 'Paused. Time is not counting.'}</p>
              {attempt.status === 'active' ? (
                <div className="w-full panel rounded-xl p-4 space-y-2">
                  <label className="block text-sm">Something pulled you away? Note it, then return.
                    <input className={field} maxLength={280} placeholder="What pulled you away?" value={f.note} onChange={(e) => set('note', e.target.value)} /></label>
                  <Btn variant="ghost" onClick={() => { run('pause', { note: f.note }); set('note', '') }}>{f.note.trim() ? 'Record interruption and pause' : 'Pause'}</Btn>
                </div>
              ) : <Btn onClick={() => run('resume', {})}>Resume the sitting</Btn>}
              {attempt.interruptions.length > 0 && <p className="text-xs text-muted">{attempt.interruptions.length} interruption(s) recorded.</p>}
            </section>

            <section className="panel ornate rounded-xl p-6 mt-8 space-y-4" aria-label="Closing">
              <h2 className="font-display text-ancient">II · Closing the ritual</h2>
              <fieldset><legend className="text-sm mb-1">Did you achieve the objective?</legend>
                <div className="flex gap-2">{[['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']].map(([v, l]) => (
                  <label key={v} className={`cursor-pointer rounded-full border px-4 py-1 ${f.outcome === v ? 'border-ancient bg-ancient/15' : 'border-white/20'}`}><input type="radio" name="outcome" className="sr-only" checked={f.outcome === v} onChange={() => set('outcome', v)} />{l}</label>))}</div></fieldset>
              {attempt.interruptions.length === 0 && <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={f.none} onChange={(e) => set('none', e.target.checked)} /> Nothing pulled me away during the sitting.</label>}
              <fieldset><legend className="text-sm mb-1">How well did you hold to your intention? (1–5)</legend>
                <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={f.rating === n} onClick={() => set('rating', n)} className={`h-10 w-10 rounded-full border ${f.rating === n ? 'border-ancient bg-ancient/20' : 'border-white/20'}`}>{n}</button>)}</div></fieldset>
              <label className="block text-sm">Reflection
                <ul className="text-xs text-muted list-disc pl-5 mb-1">{spec.prompts.map((p) => <li key={p}>{p}</li>)}</ul>
                <textarea className={field} rows={6} value={f.reflection} onChange={(e) => set('reflection', e.target.value)} /></label>
              <RubricLive text={f.reflection} gate={gate} phase="ritual" others={others} />
              {msg && <p role="alert" className="text-ember text-sm">{msg}</p>}
              <div className="flex gap-2 flex-wrap">
                <Btn onClick={finish}>Complete the ritual</Btn>
                <Btn variant="ghost" onClick={() => confirm('Set this attempt aside? You can begin again later; your stages are safe.') && run('abandon', {})}>Set aside</Btn>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
