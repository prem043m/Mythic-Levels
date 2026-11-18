import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { ATTRIBUTES, AVATARS } from '@/config/constants'
import { getGateById } from '@/data/catalog'
import { ACHIEVEMENTS } from '@/data/achievements'
import { Panel, H, Btn, Bar } from '@/components/ui'
import { GateEmblem } from '@/components/ProgressionIdentity'

export function Journal() {
  const { game, addReflection, removeReflection } = useGameStore()
  const [t, setT] = useState('')
  const list = game.progress.reflections
  return (
    <div className="space-y-4">
      <Panel>
        <H>New reflection</H>
        <textarea aria-label="Reflection" className="w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 p-2" rows={3} value={t} onChange={(e) => setT(e.target.value)} />
        <Btn className="mt-2" disabled={t.trim().length < 12} onClick={() => { addReflection(t, game.player.currentArcana + '-' + String(game.player.currentGate).padStart(2, '0')); setT('') }}>Save</Btn>
      </Panel>
      {list.length === 0 && <p className="text-muted">No reflections yet. Quest reflections you write appear in each Gate’s record.</p>}
      {list.map((r) => (
        <Panel key={r.id}>
          <p className="text-xs text-muted">{r.dateKey}{r.gateId && getGateById(r.gateId) ? <span className="inline-progression-identity"><GateEmblem gateId={r.gateId} size="tiny" state="completed" /> · {getGateById(r.gateId).name}</span> : ''}</p>
          <p className="whitespace-pre-wrap">{r.text}</p>
          <Btn variant="ghost" className="mt-2 text-sm" onClick={() => confirm('Delete this reflection?') && removeReflection(r.id)}>Delete</Btn>
        </Panel>
      ))}
    </div>
  )
}

export function Analytics() {
  const { player, progress } = useGameStore((s) => s.game)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel className="md:col-span-2"><H>Attributes</H>
        <ul className="space-y-2">{ATTRIBUTES.map((a) => (
          <li key={a.id}><div className="flex justify-between text-sm"><span>{a.label}</span><span>{player.attributes[a.id] || 0}/100</span></div>
            <Bar label={a.label} value={(player.attributes[a.id] || 0) / 100} /></li>))}</ul>
      </Panel>
      <Panel><H>Practice</H>
        <p>{progress.questsCompleted} quests · {progress.practiceMinutes} minutes</p>
        <p className="text-sm text-muted">Longest focus: {progress.longestFocusMinutes} min</p></Panel>
      <Panel><H>Resources</H>
        <p className="text-sm">{['mp', 'sp', 'ap', 'dp', 'kp', 'cp'].map((k) => `${k.toUpperCase()} ${player[k]}`).join(' · ')}</p></Panel>
    </div>
  )
}

export function Profile() {
  const { game, reset, exportJson } = useGameStore()
  const { player, settings } = game
  const glyph = AVATARS.find((a) => a.id === player.avatar)?.glyph
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'mythic-levels-save.json' })
    a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-4">
      <Panel>
        <h1 className="font-display text-3xl text-ancient">{glyph} {player.name}</h1>
        <p className="text-muted">{player.title} · {settings.difficulty} · {settings.dailyDuration} min/day</p>
        {player.primaryGoal && <p className="mt-2">Goal: {player.primaryGoal}</p>}
      </Panel>
      <Panel><H>Titles</H><p>{player.titles.join(' · ')}</p></Panel>
      <Panel><H>Achievements ({player.achievements.length}/{ACHIEVEMENTS.length})</H>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">{ACHIEVEMENTS.map((a) => {
          const on = player.achievements.includes(a.id)
          const gateId = a.id === 'gremlin-mastered' ? 'beast-01' : a.id === 'troll-mastered' ? 'beast-02' : a.id === 'beast-complete' ? 'beast-09' : a.id === 'human-complete' ? 'human-09' : a.id === 'sage-complete' ? 'sage-09' : null
          return <li key={a.id} className={on ? '' : 'opacity-40'}><b>{gateId && <GateEmblem gateId={gateId} size="tiny" state={on ? 'completed' : 'locked'} />}{on ? '✓ ' : ''}{a.name}</b><br /><span className="text-muted">{a.description}</span></li>
        })}</ul></Panel>
      <Panel><H>Save</H>
        <div className="flex gap-2 flex-wrap">
          <Btn variant="ghost" onClick={download}>Export save (JSON)</Btn>
          <Btn variant="ghost" onClick={() => confirm('This permanently erases all progress. Continue?') && reset()}>Erase all progress</Btn>
        </div></Panel>
    </div>
  )
}
