import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ARCANA_ORDER } from '@/config/constants'
import { getArcana, gatesForArcana } from '@/data/catalog'
import { Bar } from '@/components/ui'
import { generateDailyPlan } from '@/services/quests/dailyPlan'
import { ROUTES } from '@/config/routes'
import { ArcanaEmblem, GateEmblem } from '@/components/ProgressionIdentity'

const arcanaThemes = {
  beast: 'ember',
  human: 'jade',
  sage: 'celestial',
}

function completionCount(game, gates) {
  return gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
}

export function ArcanaOverview({ game }) {
  return (
    <section className="chamber-section arcana-overview" aria-labelledby="arcana-heading">
      <div className="chamber-section-heading">
        <div>
          <p className="world-eyebrow">The three paths</p>
          <h2 id="arcana-heading">Choose the current that calls you</h2>
        </div>
        <span className="chamber-coordinate">I · II · III</span>
      </div>
      <div className="arcana-sanctums">
        {ARCANA_ORDER.map((id, index) => {
          const arcana = getArcana(id)
          const gates = gatesForArcana(id)
          const complete = completionCount(game, gates)
          const current = game.player.currentArcana === id
          return (
            <motion.article
              key={id}
              className={`arcana-sanctum arcana-${id} ${current ? 'is-current' : ''}`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="arcana-sanctum-top">
                <span className="arcana-roman">{arcana.roman}</span>
                <span className="arcana-status">{current ? 'Current path' : `${complete} / ${gates.length} complete`}</span>
              </div>
              <Link to={ROUTES.realm(id)} className="arcana-sanctum-link">
                <ArcanaEmblem arcana={arcana} size="large" state={current ? 'active' : 'available'} />
                <p className="world-eyebrow">Arcana {index + 1} · {arcanaThemes[id]}</p>
                <h3>{arcana.name}</h3>
                <p className="arcana-promise">{arcana.promise}</p>
                <p className="arcana-lore">{arcana.lore}</p>
                <span className="arcana-enter">{current ? 'Continue this path' : 'Enter this realm'} <span>→</span></span>
              </Link>
              <div className="arcana-sanctum-progress">
                <span>{complete} / {gates.length} gates traversed</span>
                <Bar value={complete / gates.length} label={`${arcana.name} progress`} />
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}

export function WorldTreePreview({ game }) {
  const completed = Object.values(game.progress.gates).filter((record) => record.completedAt).length
  return (
    <section className="world-tree-preview chamber-section" aria-labelledby="tree-preview-heading">
      <div className="tree-preview-copy">
        <p className="world-eyebrow">A living map of becoming</p>
        <h2 id="tree-preview-heading">The World Tree</h2>
        <p>Every practice becomes a root, every Gate a branch. Your path is still opening.</p>
        <Link to={ROUTES.journey} className="mythic-button mythic-button-outline">View the complete tree <span>→</span></Link>
      </div>
      <div className="tree-diagram" aria-label={`${completed} of 27 Gates completed`}>
        <span className="tree-origin">ORIGIN</span>
        <span className="tree-trunk" />
        <span className="tree-branch tree-branch-beast"><i />BEAST</span>
        <span className="tree-branch tree-branch-human"><i />HUMAN</span>
        <span className="tree-branch tree-branch-sage"><i />SAGE</span>
        <span className="tree-roots">I · II · III</span>
      </div>
    </section>
  )
}

export function CurrentJourneyPanel({ gate, mastery, recommendation }) {
  if (!gate) {
    return (
      <section className="journey-panel chamber-section">
        <p className="world-eyebrow">Current journey</p>
        <h2>Your path is ready to begin</h2>
        <p className="muted-copy">Enter the World Tree to discover the first Gate.</p>
        <Link to={ROUTES.journey} className="mythic-button">Open the World Tree <span>→</span></Link>
      </section>
    )
  }
  const activityRoute = recommendation.kind === 'ritual' ? ROUTES.ritual(gate.id) : ROUTES.gate(gate.id)
  return (
    <section className={`journey-panel chamber-section arcana-${gate.arcana}`} aria-labelledby="journey-heading">
      <div className="chamber-section-heading">
        <div><p className="world-eyebrow">Your current journey</p><h2 id="journey-heading">{gate.name}</h2></div>
        <span className="gate-index">Gate {gate.gateNumber}</span>
      </div>
      <div className="journey-identity"><GateEmblem gate={gate} size="small" state="active" /><span>{getArcana(gate.arcana)?.name} · Stage {recommendation.stageDay || 'Ritual'}</span></div>
      <p className="journey-description">{gate.description || gate.lore}</p>
      <div className="journey-progress-row"><span>Gate mastery</span><strong>{Math.round(mastery * 100)}%</strong></div>
      <Bar value={mastery} label="Current gate mastery" />
      <div className="journey-next"><span>Next valid activity</span><strong>{recommendation.title}</strong><small>{recommendation.reason}</small></div>
      <Link to={activityRoute} className="mythic-button">Continue journey <span>→</span></Link>
    </section>
  )
}

export function DailyQuestPreview({ game, recommendation }) {
  const plan = generateDailyPlan(game)
  const record = game.progress.gates[recommendation.gateId] || { days: {} }
  const slots = plan ? Object.entries(plan).filter(([key, value]) => key !== 'dateKey' && value) : []
  const completed = slots.filter(([, quest]) => quest.kind === 'main'
    ? Boolean(record.days[recommendation.stageDay]?.completedAt)
    : false).length
  return (
    <section className="quest-panel chamber-section" aria-labelledby="quest-heading">
      <div className="chamber-section-heading"><div><p className="world-eyebrow">Today’s practice</p><h2 id="quest-heading">The daily observance</h2></div><span className="quest-rune">◇</span></div>
      <div className="quest-summary"><strong>{completed} / {slots.length}</strong><span>prepared practices complete</span></div>
      <div className="quest-slots">
        {slots.map(([slot, quest]) => (
          <div key={slot} className="quest-slot">
            <span>{slot}</span><strong><GateEmblem gateId={recommendation.gateId} size="tiny" state="active" />{quest.title}</strong><small>{quest.minutes} minutes · {quest.task}</small>
          </div>
        ))}
      </div>
      <Link to={ROUTES.quests} className="text-link">Shape today’s practice <span>→</span></Link>
    </section>
  )
}

export function MilestonePanel({ gate, mastery, recommendation }) {
  const next = recommendation.kind === 'next-gate' ? 'The next Gate awaits' : recommendation.kind === 'ritual' ? 'Complete the final ritual' : `${Math.max(0, Math.round((1 - mastery) * 100))}% remains to master this Gate`
  const detail = gate ? `${gate.name} · ${getArcana(gate.arcana)?.name}` : 'Return to the World Tree'
  return (
    <section className="milestone-panel">
      <span className="milestone-rune">✦</span>
      <div><p className="world-eyebrow">Next milestone</p><strong>{next}</strong><small>{detail}</small></div>
    </section>
  )
}

export const ArcanaWorldMap = ArcanaOverview
export const CurrentPathPanel = CurrentJourneyPanel
export const DailyQuestPanel = DailyQuestPreview
