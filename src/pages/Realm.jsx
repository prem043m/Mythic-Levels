import { Link, Navigate, useParams } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { ROUTES, isArcanaId } from '@/config/routes'
import { getArcana, gatesForArcana } from '@/data/catalog'
import { canUnlockGate } from '@/services/progression/unlocks'
import { getGateMastery } from '@/services/progression/engine'
import { Panel } from '@/components/ui'
import { ArcanaEmblem, GateEmblem } from '@/components/ProgressionIdentity'

function gateState(game, gate) {
  const record = game.progress.gates[gate.id]
  if (record?.completedAt) {
    const { mastery, evaluation } = getGateMastery(game, gate.id)
    return mastery >= evaluation.threshold ? 'mastered' : 'completed'
  }
  if (game.player.currentArcana === gate.arcana && game.player.currentGate === gate.gateNumber) return 'current'
  if (record?.unlocked && canUnlockGate(game, gate.id)) return 'available'
  return 'locked'
}

function BeastGate({ game, gate, index }) {
  const state = gateState(game, gate)
  const record = game.progress.gates[gate.id]
  const { mastery } = getGateMastery(game, gate.id)
  const content = (
    <>
      <div className="beast-gate-art">
        <GateEmblem gate={gate} size="realm" state={state} />
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="beast-gate-copy">
        <span className="beast-gate-state">Gate {gate.gateNumber} · {state}</span>
        <h3>{gate.name}</h3>
        <p>{gate.lore}</p>
        {record?.completedAt && <span className="beast-gate-mastery">Mastery {Math.round(mastery * 100)}%</span>}
      </div>
    </>
  )
  return (
    <li className={`beast-gate beast-gate-${state}`}>
      {state === 'locked'
        ? <div className="beast-gate-link" aria-disabled="true" title={`${gate.name} is locked until the previous Gate is complete.`}>{content}</div>
        : <Link to={ROUTES.gate(gate.id)} className="beast-gate-link" aria-label={`${gate.name}, Gate ${gate.gateNumber}, ${state}`}>{content}</Link>}
    </li>
  )
}

function BeastRealm({ game }) {
  const arcana = getArcana('beast')
  const gates = gatesForArcana('beast')
  const completed = gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
  const mastered = gates.filter((gate) => gateState(game, gate) === 'mastered').length
  const currentGate = game.player.currentArcana === 'beast'
    ? gates.find((gate) => gate.gateNumber === game.player.currentGate)
    : null
  const currentMastery = currentGate ? getGateMastery(game, currentGate.id).mastery : 0
  return (
    <div className="beast-realm-page">
      <Link to={ROUTES.journey} className="realm-back-link">← Return to the World Tree</Link>
      <header className="beast-realm-hero">
        <div className="beast-atmosphere" aria-hidden="true"><span /><i /><b /></div>
        <ArcanaEmblem arcana={arcana} size="hero" state={game.player.currentArcana === 'beast' ? 'active' : 'available'} />
        <div className="beast-realm-heading">
          <p className="world-eyebrow">Arcana I · The primordial wilds</p>
          <h1>Beast Arcana</h1>
          <p className="beast-realm-subtitle">Realm of Primordial Wilds</p>
          <p className="beast-realm-lore">{arcana.lore}</p>
        </div>
      </header>
      <section className="beast-realm-stats" aria-label="Beast Arcana progression">
        <div><span>Total Gates</span><strong>9</strong></div>
        <div><span>Completed</span><strong>{completed}</strong></div>
        <div><span>Mastered</span><strong>{mastered}</strong></div>
        <div><span>Realm progress</span><strong>{completed} / 9</strong></div>
      </section>
      {currentGate ? (
        <section className="beast-current-gate" aria-labelledby="beast-current-heading">
          <div><span className="beast-current-rune">✦</span><div><p className="world-eyebrow">The fire before you</p><h2 id="beast-current-heading">{currentGate.name}</h2><p>Gate {currentGate.gateNumber} · {Math.round(currentMastery * 100)}% mastery</p></div></div>
          <Link to={ROUTES.gate(currentGate.id)} className="mythic-button beast-button">Continue the hunt <span>→</span></Link>
        </section>
      ) : completed === gates.length ? (
        <section className="beast-complete-state"><span>✦</span><div><p className="world-eyebrow">The wild has been integrated</p><h2>The Beast Arcana is complete</h2><p>Return to the World Tree to follow the path into the next Arcana.</p></div><Link to={ROUTES.journey} className="text-link">Return to the World Tree <span>→</span></Link></section>
      ) : null}
      <section className="beast-gates-section" aria-labelledby="beast-gates-heading">
        <div className="beast-section-heading"><div><p className="world-eyebrow">Nine trials of the wild</p><h2 id="beast-gates-heading">The Beast Gates</h2></div><span className="beast-section-mark">I — IX</span></div>
        <ol className="beast-gate-path gate-grid-standard">{gates.map((gate, index) => <BeastGate key={gate.id} game={game} gate={gate} index={index} />)}</ol>
      </section>
    </div>
  )
}

function HumanGate({ game, gate, index }) {
  const state = gateState(game, gate)
  const record = game.progress.gates[gate.id]
  const { mastery } = getGateMastery(game, gate.id)
  const content = (
    <>
      <div className="human-gate-art">
        <GateEmblem gate={gate} size="realm" state={state} />
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="human-gate-copy">
        <span className="human-gate-state">Gate {gate.gateNumber} · {state}</span>
        <h3>{gate.name}</h3>
        <p>{gate.lore}</p>
        {record?.completedAt && <span className="human-gate-mastery">Mastery {Math.round(mastery * 100)}%</span>}
      </div>
    </>
  )
  return (
    <li className={`human-gate human-gate-${state}`}>
      {state === 'locked'
        ? <div className="human-gate-link" aria-disabled="true" title={`${gate.name} is locked until the previous Gate is complete.`}>{content}</div>
        : <Link to={ROUTES.gate(gate.id)} className="human-gate-link" aria-label={`${gate.name}, Gate ${gate.gateNumber}, ${state}`}>{content}</Link>}
    </li>
  )
}

function HumanRealm({ game }) {
  const arcana = getArcana('human')
  const gates = gatesForArcana('human')
  const completed = gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
  const mastered = gates.filter((gate) => gateState(game, gate) === 'mastered').length
  const currentGate = game.player.currentArcana === 'human'
    ? gates.find((gate) => gate.gateNumber === game.player.currentGate)
    : null
  const currentMastery = currentGate ? getGateMastery(game, currentGate.id).mastery : 0
  return (
    <div className="human-realm-page">
      <Link to={ROUTES.journey} className="realm-back-link human-back-link">← Return to the World Tree</Link>
      <header className="human-realm-hero">
        <div className="human-architecture" aria-hidden="true"><span /><i /><b /></div>
        <ArcanaEmblem arcana={arcana} size="hero" state={game.player.currentArcana === 'human' ? 'active' : 'available'} />
        <div className="human-realm-heading">
          <p className="world-eyebrow">Arcana II · The conscious middle path</p>
          <h1>Human Arcana</h1>
          <p className="human-realm-subtitle">Realm of Becoming</p>
          <p className="human-realm-lore">{arcana.lore}</p>
        </div>
      </header>
      <section className="human-realm-stats" aria-label="Human Arcana progression">
        <div><span>Total Gates</span><strong>9</strong></div>
        <div><span>Completed</span><strong>{completed}</strong></div>
        <div><span>Mastered</span><strong>{mastered}</strong></div>
        <div><span>Realm progress</span><strong>{completed} / 9</strong></div>
      </section>
      {currentGate ? (
        <section className="human-current-gate" aria-labelledby="human-current-heading">
          <div><span className="human-current-rune">◈</span><div><p className="world-eyebrow">The practice before you</p><h2 id="human-current-heading">{currentGate.name}</h2><p>Gate {currentGate.gateNumber} · {Math.round(currentMastery * 100)}% mastery</p></div></div>
          <Link to={ROUTES.gate(currentGate.id)} className="mythic-button human-button">Continue the practice <span>→</span></Link>
        </section>
      ) : completed === gates.length ? (
        <section className="human-complete-state"><span>✦</span><div><p className="world-eyebrow">The human form is integrated</p><h2>The Human Arcana is complete</h2><p>Return to the World Tree to follow the path toward the Sage.</p></div><Link to={ROUTES.journey} className="text-link">Return to the World Tree <span>→</span></Link></section>
      ) : null}
      <section className="human-gates-section" aria-labelledby="human-gates-heading">
        <div className="human-section-heading"><div><p className="world-eyebrow">Nine disciplines of becoming</p><h2 id="human-gates-heading">The Human Gates</h2></div><span className="human-section-mark">I — IX</span></div>
        <ol className="human-gate-court gate-grid-standard">{gates.map((gate, index) => <HumanGate key={gate.id} game={game} gate={gate} index={index} />)}</ol>
      </section>
    </div>
  )
}

function SageGate({ game, gate, index }) {
  const state = gateState(game, gate)
  const record = game.progress.gates[gate.id]
  const { mastery } = getGateMastery(game, gate.id)
  const content = (
    <>
      <div className="sage-gate-art">
        <GateEmblem gate={gate} size="realm" state={state} />
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="sage-gate-copy">
        <span className="sage-gate-state">Gate {gate.gateNumber} · {state}</span>
        <h3>{gate.name}</h3>
        <p>{gate.lore}</p>
        {record?.completedAt && <span className="sage-gate-mastery">Mastery {Math.round(mastery * 100)}%</span>}
      </div>
    </>
  )
  return (
    <li className={`sage-gate sage-gate-${state}`}>
      {state === 'locked'
        ? <div className="sage-gate-link" aria-disabled="true" title={`${gate.name} is locked until the previous Gate is complete.`}>{content}</div>
        : <Link to={ROUTES.gate(gate.id)} className="sage-gate-link" aria-label={`${gate.name}, Gate ${gate.gateNumber}, ${state}`}>{content}</Link>}
    </li>
  )
}

function SageRealm({ game }) {
  const arcana = getArcana('sage')
  const gates = gatesForArcana('sage')
  const completed = gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
  const mastered = gates.filter((gate) => gateState(game, gate) === 'mastered').length
  const currentGate = completed < gates.length && game.player.currentArcana === 'sage'
    ? gates.find((gate) => gate.gateNumber === game.player.currentGate)
    : null
  const currentMastery = currentGate ? getGateMastery(game, currentGate.id).mastery : 0
  return (
    <div className="sage-realm-page">
      <Link to={ROUTES.journey} className="realm-back-link sage-back-link">← Return to the World Tree</Link>
      <header className="sage-realm-hero">
        <div className="sage-atmosphere" aria-hidden="true"><span /><i /><b /></div>
        <div className="sage-hero-art"><ArcanaEmblem arcana={arcana} size="hero" state={game.player.currentArcana === 'sage' ? 'active' : 'available'} /></div>
        <div className="sage-realm-heading">
          <p className="world-eyebrow">Arcana III · The celestial sanctuary</p>
          <h1>Sage Arcana</h1>
          <p className="sage-realm-subtitle">Celestial Sanctuary</p>
          <p className="sage-realm-lore">{arcana.lore}</p>
        </div>
      </header>
      <section className="sage-realm-stats" aria-label="Sage Arcana progression">
        <div><span>Total Gates</span><strong>9</strong></div>
        <div><span>Completed</span><strong>{completed}</strong></div>
        <div><span>Mastered</span><strong>{mastered}</strong></div>
        <div><span>Realm progress</span><strong>{completed} / 9</strong></div>
      </section>
      {currentGate ? (
        <section className="sage-current-gate" aria-labelledby="sage-current-heading">
          <div><span className="sage-current-rune">✧</span><div><p className="world-eyebrow">The horizon before you</p><h2 id="sage-current-heading">{currentGate.name}</h2><p>Gate {currentGate.gateNumber} · {Math.round(currentMastery * 100)}% mastery</p></div></div>
          <Link to={ROUTES.gate(currentGate.id)} className="mythic-button sage-button">Continue the ascent <span>→</span></Link>
        </section>
      ) : completed === gates.length ? (
        <section className="sage-complete-state"><span>✧</span><div><p className="world-eyebrow">The sanctuary is integrated</p><h2>The Sage Arcana is complete</h2><p>Return to the World Tree to reflect on the path you have made.</p></div><Link to={ROUTES.journey} className="text-link">Return to the World Tree <span>→</span></Link></section>
      ) : null}
      <section className="sage-gates-section" aria-labelledby="sage-gates-heading">
        <div className="sage-section-heading"><div><p className="world-eyebrow">Nine thresholds of illumination</p><h2 id="sage-gates-heading">The Sage Gates</h2></div><span className="sage-section-mark">I — IX</span></div>
        <ol className="sage-gate-constellation gate-grid-standard">{gates.map((gate, index) => <SageGate key={gate.id} game={game} gate={gate} index={index} />)}</ol>
      </section>
    </div>
  )
}

export default function Realm() {
  const { arcanaId } = useParams()
  const game = useGameStore((state) => state.game)
  if (!isArcanaId(arcanaId)) return <Navigate to={ROUTES.journey} replace />
  if (!game) return null
  if (arcanaId === 'beast') return <BeastRealm game={game} />
  if (arcanaId === 'human') return <HumanRealm game={game} />
  if (arcanaId === 'sage') return <SageRealm game={game} />

  const arcana = getArcana(arcanaId)
  const gates = gatesForArcana(arcanaId)
  const completed = gates.filter((gate) => game.progress.gates[gate.id]?.completedAt).length
  return (
    <div className={`space-y-6 accent-${arcanaId}`}>
      <Link to={ROUTES.journey} className="text-sm text-muted underline">← Back to the World Tree</Link>
      <Panel className="accent-edge">
        <p className="engraved text-xs accent-text">{arcana.roman} · Realm</p>
        <h1 className="font-display text-4xl accent-text">{arcana.glyph} {arcana.name}</h1>
        <p className="mt-2 text-muted">{arcana.promise}</p>
        <p className="mt-4 max-w-3xl">{arcana.lore}</p>
        <p className="mt-4 text-sm accent-text">{completed}/{gates.length} Gates complete</p>
      </Panel>
      <Panel className="accent-edge">
        <h2 className="font-display text-xl accent-text">The Gates of {arcana.name}</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gates.map((gate) => {
            const record = game.progress.gates[gate.id]
            const locked = !record?.unlocked
            const current = game.player.currentArcana === arcanaId && game.player.currentGate === gate.gateNumber
            return <li key={gate.id}>{locked
              ? <div className="rounded-lg border border-white/10 p-4 opacity-50" aria-disabled="true"><span className="text-xs text-muted">Gate {gate.gateNumber} · Locked</span><strong className="mt-1 block">{gate.name}</strong></div>
              : <Link to={ROUTES.gate(gate.id)} className={`block rounded-lg border p-4 hover:bg-white/5 ${current ? 'accent-edge accent-glow' : 'border-white/15'}`}><span className="text-xs accent-text">Gate {gate.gateNumber}{current ? ' · Current' : record?.completedAt ? ' · Completed' : ''}</span><strong className="mt-1 block">{gate.name}</strong></Link>}
            </li>
          })}
        </ol>
      </Panel>
    </div>
  )
}
