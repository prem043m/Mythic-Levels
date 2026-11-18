import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { generateDailyPlan } from '@/services/quests/dailyPlan'
import { isAvailableOn } from '@/services/settings/settings'
import { todayKey, addDays } from '@/utils/dates'
import { Panel, H, Btn } from '@/components/ui'
import { getGateByPosition } from '@/data/catalog'
import { GateEmblem } from '@/components/ProgressionIdentity'

const SLOTS = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']]
const field = 'w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2 text-ink'

function PlanEditor({ title, plan, isSaved, onSave, gate }) {
  const [p, setP] = useState(plan)
  const [dirty, setDirty] = useState(false)
  const edit = (slot, k, v) => { setP((x) => ({ ...x, [slot]: { ...x[slot], [k]: v } })); setDirty(true) }
  const save = () => {
    const clean = { ...p }
    for (const [slot] of SLOTS) {
      if (!clean[slot]) continue
      const minutes = Math.min(180, Math.max(5, Math.round(Number(clean[slot].minutes)) || 5))
      clean[slot] = { ...clean[slot], minutes, task: String(clean[slot].task || '').slice(0, 400) }
    }
    onSave(clean); setP(clean); setDirty(false)
  }
  return (
    <Panel>
      <H>{title}</H>
      <div className="space-y-4">
        {SLOTS.map(([slot, label]) => {
          const s = p[slot]
          if (!s) return <p key={slot} className="text-sm text-muted">{label}: this Gate’s work is complete.</p>
          return (
            <div key={slot} className="space-y-1">
              <p className="font-display">{gate && <GateEmblem gate={gate} size="tiny" state="active" />}{label} — {s.title}</p>
              <label className="block text-sm text-muted">Task
                <textarea className={field} rows={2} value={s.task} onChange={(e) => edit(slot, 'task', e.target.value)} />
              </label>
              <label className="block text-sm text-muted w-32">Minutes
                <input type="number" min={5} max={180} className={field} value={s.minutes} onChange={(e) => edit(slot, 'minutes', e.target.value)} />
              </label>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Btn onClick={save} disabled={!dirty && isSaved}>{isSaved ? 'Update plan' : 'Save plan'}</Btn>
        <span className="text-xs text-muted" role="status">{dirty ? 'Unsaved changes' : isSaved ? 'Saved' : 'Draft — not saved yet'}</span>
      </div>
    </Panel>
  )
}

export default function Plan() {
  const { game, savePlan } = useGameStore()
  const today = todayKey()
  const tomorrow = addDays(today, 1)
  const tmrwDate = new Date(); tmrwDate.setDate(tmrwDate.getDate() + 1)
  const gate = getGateByPosition(game.player.currentArcana, game.player.currentGate)
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-ancient">Daily Plan</h1>
      {!isAvailableOn(game.settings) && <p className="text-sm text-muted">Today is a rest day in your schedule. Practice is still allowed; rest is part of the path.</p>}
      <PlanEditor key={`${today}-${Boolean(game.progress.dailyPlans[today])}`} title={`Today · ${today}`} plan={generateDailyPlan(game, today)} isSaved={Boolean(game.progress.dailyPlans[today])} onSave={savePlan} gate={gate} />
      <PlanEditor key={`${tomorrow}-${Boolean(game.progress.dailyPlans[tomorrow])}`}
        title={`Tomorrow · ${tomorrow}${isAvailableOn(game.settings, tmrwDate) ? '' : ' (rest day)'}`}
        plan={generateDailyPlan(game, tomorrow)} isSaved={Boolean(game.progress.dailyPlans[tomorrow])} onSave={savePlan} gate={gate} />
    </div>
  )
}
