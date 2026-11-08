import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { ARCANA_ORDER } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { getArcana, gatesForArcana } from '@/data/catalog'
import { Panel } from '@/components/ui'

function gateState(game, gate) {
  const record = game.progress.gates[gate.id]
  if (record?.completedAt) return 'Completed'
  if (!record?.unlocked) return 'Locked'
  if (game.player.currentArcana === gate.arcana && game.player.currentGate === gate.gateNumber) return 'Current'
  return 'Open'
}

export default function Journey() {
  const game = useGameStore((state) => state.game)
  if (!game) return null

  return (
    <div className="space-y-6">
      <header>
        <p className="engraved text-xs text-ancient">The Journey</p>
        <h1 className="font-display text-3xl text-ancient">The World Tree</h1>
        <p className="text-muted">Three realms. Twenty-seven Gates. One living path.</p>
      </header>
      {ARCANA_ORDER.map((id) => {
        const arcana = getArcana(id)
        const gates = gatesForArcana(id)
        return (
          <Panel key={id} className={`accent-${id} accent-edge`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="engraved text-xs accent-text">{arcana.roman} · Arcana</p>
                <h2 className="font-display text-2xl accent-text">{arcana.glyph} {arcana.name}</h2>
                <p className="text-muted">{arcana.promise}</p>
              </div>
              <Link className="text-sm accent-text underline" to={ROUTES.realm(id)}>Enter realm</Link>
            </div>
            <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {gates.map((gate) => {
                const state = gateState(game, gate)
                return (
                  <li key={gate.id}>
                    {state === 'Locked'
                      ? <div className="rounded-lg border border-white/10 p-3 opacity-50" aria-disabled="true">
                          <span className="text-sm text-muted">Gate {gate.gateNumber} · Locked</span>
                          <strong className="mt-1 block">{gate.name}</strong>
                        </div>
                      : <Link to={ROUTES.gate(gate.id)} className={`block rounded-lg border p-3 transition ${state === 'Current' ? 'accent-edge accent-glow' : state === 'Completed' ? 'accent-edge' : 'border-white/15'} hover:bg-white/5`}>
                          <span className="text-xs accent-text">Gate {gate.gateNumber} · {state}</span>
                          <strong className="mt-1 block">{gate.name}</strong>
                        </Link>}
                  </li>
                )
              })}
            </ol>
          </Panel>
        )
      })}
    </div>
  )
}
