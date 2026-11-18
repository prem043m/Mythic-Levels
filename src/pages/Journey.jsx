import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { ARCANA_ORDER } from '@/config/constants'
import { getArcana, gatesForArcana } from '@/data/catalog'
import { canUnlockGate } from '@/services/progression/unlocks'
import { getGateMastery } from '@/services/progression/engine'
import { ROUTES } from '@/config/routes'
import { ArcanaEmblem, GateEmblem } from '@/components/ProgressionIdentity'

const STATE_LABELS = {
  locked: 'Locked',
  available: 'Available',
  active: 'Current Gate',
  completed: 'Completed',
  mastered: 'Mastered',
}

function getGateState(game, gate) {
  const record = game.progress.gates[gate.id]
  if (record?.completedAt) {
    const { mastery, evaluation } = getGateMastery(game, gate.id)
    return mastery >= evaluation.threshold ? 'mastered' : 'completed'
  }
  if (game.player.currentArcana === gate.arcana && game.player.currentGate === gate.gateNumber) return 'active'
  if (record?.unlocked && canUnlockGate(game, gate.id)) return 'available'
  return 'locked'
}

function GateNode({ game, gate, index }) {
  const state = getGateState(game, gate)
  const label = `${gate.name}, Gate ${gate.gateNumber}, ${STATE_LABELS[state]}`
  const content = (
    <>
      <span className="tree-node-number">{String(index + 1).padStart(2, '0')}</span>
      <GateEmblem gate={gate} size="tiny" state={state} />
      <span className="tree-node-name">{gate.name}</span>
      <span className="tree-node-state">{STATE_LABELS[state]}</span>
    </>
  )
  return (
    <li className={`tree-gate tree-gate-${state}`}>
      {state === 'locked'
        ? <div className="tree-node" aria-disabled="true" title={`${gate.name} is locked until the previous Gate is complete.`}>{content}</div>
        : <Link to={ROUTES.gate(gate.id)} className="tree-node" aria-label={label}>{content}</Link>}
      {index < 8 && <span className="tree-connection" aria-hidden="true" />}
    </li>
  )
}

function ArcanaBranch({ game, arcanaId }) {
  const arcana = getArcana(arcanaId)
  const gates = gatesForArcana(arcanaId)
  const completed = gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
  return (
    <section className={`tree-arcana tree-arcana-${arcanaId}`} aria-labelledby={`tree-${arcanaId}-heading`}>
      <header className="tree-arcana-header">
        <ArcanaEmblem arcana={arcana} size="small" state={game.player.currentArcana === arcanaId ? 'active' : 'available'} />
        <div>
          <p className="world-eyebrow">{arcana.roman} · Arcana</p>
          <h2 id={`tree-${arcanaId}-heading`}>{arcana.name}</h2>
          <p>{arcana.promise}</p>
        </div>
        <span className="tree-arcana-count">{completed} / {gates.length}</span>
      </header>
      <ol className="tree-gates" aria-label={`${arcana.name} Gates`}>
        {gates.map((gate, index) => <GateNode key={gate.id} game={game} gate={gate} index={index} />)}
      </ol>
      <Link to={ROUTES.realm(arcanaId)} className="tree-realm-link">Enter {arcana.name} <span>→</span></Link>
    </section>
  )
}

export default function Journey() {
  const game = useGameStore((state) => state.game)
  if (!game) return null
  const current = game.player.currentArcana
  const currentGate = game.player.currentGate
  return (
    <div className="world-tree-page">
      <header className="tree-page-header">
        <div>
          <p className="world-eyebrow">The living progression map</p>
          <h1>The World Tree</h1>
          <p>Twenty-seven Gates arranged along the path from Beast to Human to Sage.</p>
        </div>
        <div className="tree-position" aria-label={`Current position: ${current} Gate ${currentGate}`}>
          <ArcanaEmblem arcanaId={current} size="tiny" state="active" />
          <span><small>Current position</small><strong>{current} · Gate {currentGate}</strong></span>
        </div>
      </header>
      <div className="tree-legend" aria-label="Gate state legend">
        {Object.entries(STATE_LABELS).map(([state, label]) => <span key={state} className={`legend-${state}`}><i aria-hidden="true" />{label}</span>)}
      </div>
      <div className="world-tree-map">
        <div className="tree-origin-marker" aria-hidden="true"><span>ORIGIN</span><i /></div>
        <div className="tree-direction" aria-hidden="true"><span>BEAST</span><i /><span>HUMAN</span><i /><span>SAGE</span></div>
        {ARCANA_ORDER.map((id) => <ArcanaBranch key={id} game={game} arcanaId={id} />)}
      </div>
      <p className="tree-footnote">Locked Gates reveal themselves when the preceding Gate is completed. Select an available Gate to enter its chamber.</p>
    </div>
  )
}
