import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ARCANA_ORDER } from '@/config/constants'
import { getArcana, gatesForArcana } from '@/data/catalog'
import { Panel, Bar } from '@/components/ui'
import { generateDailyPlan } from '@/services/quests/dailyPlan'

const descriptions = {
  beast: ['The Power Within', 'Volcanic will, instinct, and embodied force.'],
  human: ['The Discipline of Life', 'The craft of choosing, speaking, and connecting.'],
  sage: ['The Wisdom Beyond', 'Stillness, knowledge, and compassionate clarity.'],
}

export function ArcanaWorldMap({ game }) {
  return (
    <section className="world-map-panel">
      <div className="world-map-heading"><div><p className="world-eyebrow">The three realms</p><h2>Arcana world map</h2></div><span className="map-coordinate">I · II · III</span></div>
      <div className="arcana-map">
        {ARCANA_ORDER.map((id, index) => {
          const arcana = getArcana(id)
          const gates = gatesForArcana(id)
          const complete = gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
          const current = game.player.currentArcana === id
          return <motion.div key={id} className={`arcana-region arcana-${id} ${current ? 'is-current' : ''}`} whileHover={{ y: -4 }}>
            <div className="arcana-orbit"><span>{arcana.glyph}</span></div>
            <p className="world-eyebrow">Arcana {index + 1}</p>
            <h3>{arcana.name}</h3>
            <strong>{descriptions[id][0]}</strong>
            <p>{descriptions[id][1]}</p>
            <div className="arcana-progress"><span>{complete} / {gates.length} gates</span><Bar value={complete / gates.length} label={`${arcana.name} progress`} /></div>
            <Link to={`/arcanas#${id}`} className="arcana-link">{current ? 'Continue realm' : 'View realm'} <span>→</span></Link>
          </motion.div>
        })}
      </div>
    </section>
  )
}

export function CurrentPathPanel({ gate, mastery, recommendation }) {
  return <Panel className={`current-path-panel arcana-${gate.arcana}`}>
    <div className="panel-heading"><div><p className="world-eyebrow">Your current path</p><h2>{gate.name}</h2></div><span className="path-gate">Gate {gate.gateNumber}</span></div>
    <p className="path-description">{gate.description || gate.lore}</p>
    <div className="path-meta"><span>Arcana · {gate.arcana}</span><span>Mastery · {Math.round(mastery * 100)}%</span><span>Stage · {recommendation.stageDay || 'Ritual'}</span></div>
    <Bar value={mastery} label="Current gate mastery" />
    <Link to={`/gate/${gate.id}`} className="mythic-button">Enter current gate <span>→</span></Link>
  </Panel>
}

export function DailyQuestPanel({ recommendation, game }) {
  const plan = generateDailyPlan(game)
  return <Panel className="daily-quest-panel">
    <div className="panel-heading"><div><p className="world-eyebrow">Today’s quest</p><h2>{plan ? 'Your prepared practice' : recommendation.title}</h2></div><span className="quest-rune">◇</span></div>
    {plan ? <div className="quest-slots">{Object.entries(plan).filter(([key, value]) => key !== 'dateKey' && value).map(([slot, value]) => <div key={slot} className="quest-slot"><span>{slot}</span><strong>{value.title}</strong><small>{value.minutes} minutes · {value.task}</small></div>)}</div> : <p className="path-description">{recommendation.reason}</p>}
    <Link to="/plan" className="text-link">Shape today’s practice <span>→</span></Link>
  </Panel>
}
