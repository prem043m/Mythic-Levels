import { completeQuest, ritualAction, createInitialState } from '@/services/progression/engine'
import { addDays } from '@/utils/dates'

export const STAGE_TEXT = [
  'Yesterday morning my phone buzzed during my focus session and I noticed the urge to check it because I wanted relief from a hard task. I turned it face down, and I learned that next time I will name the urge first.',
  'This afternoon I watched my attention drift whenever an email notification arrived while I wrote my report; the trigger was the small sound. I wrote each drift on paper and saw a clear pattern every time the sound came.',
  'Today at lunch I practised ten minutes of single task work with my screen cleared. I closed every extra tab, set a timer, and I kept my attention on one paragraph until it was done; I learned that starting small helps.',
  'Last night I tried to study while my chat window kept pinging because friends were awake. I muted the chat, put my phone in the hallway, and when the urge to peek returned I breathed and stayed with my task instead.',
  'This evening at work a colleague interrupted me twice during a spreadsheet task. I asked to talk later, wrote down his question, and returned to my focus; I noticed that saying it kindly worked better than ignoring him.',
  'Yesterday during a three hour study block I silenced all alerts, left my phone downstairs and worked in forty minute rounds. I felt the pull to switch tabs every time the work got hard, because that is my usual escape, but I stayed.',
  'Today I reviewed the whole week: my main trigger is boredom during difficult tasks, and every time I changed my environment first, my attention held. Next time I will prepare my desk the night before and I will keep one task open.',
]
export const RITUAL_TEXT = 'During the sitting the strongest pull came about twenty minutes in because a message alert lit my screen. I turned the phone over and returned to my report, and I learned that naming the urge helped; next time I will put the phone in another room before I begin.'
export const JUNK = 'aaaaaaaaaaaaaaaa'
// Short but valid reflections (accepted, lower quality) for stages 1, 4 and 7.
export const THIN = {
  0: 'Today I noticed my focus breaking whenever my phone lit up, because I wanted an easy escape from my work.',
  3: 'I put my phone away when the urge came because the task felt hard, and I kept my attention on it.',
  6: 'Looking back, I realised my focus breaks when work gets hard because I want relief; next time I will start smaller.',
}
export const T0 = Date.UTC(2026, 2, 20, 9, 0, 0)

export const newPlayer = () => createInitialState({ name: 'Test' })

/** Complete stages `from..to`, `perDay` stages per calendar day, using texts[i] (default: good texts). */
export function playStages(state, gate, { from = 1, to = 7, perDay = 2, start = '2026-03-01', texts = STAGE_TEXT } = {}) {
  let s = state
  for (let d = from; d <= to; d += 1) {
    const r = completeQuest(s, { gateId: gate.id, questId: gate.days[d - 1].id, reflection: texts[d - 1], dateKey: addDays(start, Math.floor((d - 1) / perDay)) })
    if (!r.ok) throw new Error(`stage ${d} failed: ${r.error}`)
    s = r.state
  }
  return s
}

export function playRitual(state, gate, { minutes = 45, outcome = 'yes', reflection = RITUAL_TEXT, t0 = T0, dateKey = '2026-03-10' } = {}) {
  const act = (st, action, payload, now) => ritualAction(st, { gateId: gate.id, action, payload, now, dateKey })
  let r = act(state, 'prepare', { task: 'Write the report', intention: 'Stay with one task', checked: 4 }, t0)
  if (!r.ok) throw new Error(`prepare: ${r.error}`)
  r = act(r.state, 'start', {}, t0)
  return act(r.state, 'finish', { outcome, noInterruptions: true, selfRating: 4, reflection }, t0 + minutes * 60000)
}
