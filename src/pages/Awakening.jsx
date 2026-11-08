import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { AVATARS, DIFFICULTY } from '@/config/constants'
import { Panel, Btn } from '@/components/ui'
import Restore from '@/components/Restore'

const AREAS = ['Focus', 'Discipline', 'Communication', 'Emotional balance', 'Knowledge', 'Connection']
const field = 'w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2 text-ink'

export default function Awakening() {
  const awaken = useGameStore((s) => s.awaken)
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', avatar: 'lantern', primaryGoal: '', difficulty: 'standard', dailyDuration: 25, improveAreas: [] })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const toggle = (a) => set('improveAreas', f.improveAreas.includes(a) ? f.improveAreas.filter((x) => x !== a) : [...f.improveAreas, a])
  const valid = f.name.trim().length > 0
  const submit = (e) => { e.preventDefault(); if (!valid) return; awaken(f); nav('/dashboard') }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="font-display engraved text-3xl text-ancient mb-1">The Awakening</h1>
      <p className="text-muted mb-6">Tell the system who is walking in. You can change nothing here by pretending — only by practicing.</p>
      <form onSubmit={submit}><Panel className="space-y-5">
        <label className="block">Your name
          <input className={field} value={f.name} maxLength={40} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <fieldset><legend className="mb-2">Sigil</legend>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <label key={a.id} className={`cursor-pointer rounded-lg border px-3 py-2 ${f.avatar === a.id ? 'border-ancient glow-ancient' : 'border-ancient-dim/40'}`}>
                <input type="radio" name="avatar" className="sr-only" checked={f.avatar === a.id} onChange={() => set('avatar', a.id)} />
                <span aria-hidden>{a.glyph}</span> {a.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">Primary goal
          <textarea className={field} rows={2} value={f.primaryGoal} onChange={(e) => set('primaryGoal', e.target.value)} />
        </label>
        <fieldset><legend className="mb-2">Areas to improve</legend>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <label key={a} className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${f.improveAreas.includes(a) ? 'border-mystic bg-mystic/20' : 'border-ancient-dim/40'}`}>
                <input type="checkbox" className="sr-only" checked={f.improveAreas.includes(a)} onChange={() => toggle(a)} />{a}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <label>Difficulty
            <select className={field} value={f.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              {Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label>Minutes per day
            <input type="number" min={10} max={90} className={field} value={f.dailyDuration} onChange={(e) => set('dailyDuration', e.target.value)} />
          </label>
        </div>
        <Btn type="submit" disabled={!valid}>Cross the threshold</Btn>
      </Panel></form>
      <Restore />
    </main>
  )
}
