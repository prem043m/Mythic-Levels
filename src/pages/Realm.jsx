import { Link, Navigate, useParams } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { ROUTES, isArcanaId } from '@/config/routes'
import { getArcana, gatesForArcana } from '@/data/catalog'
import { Panel } from '@/components/ui'

export default function Realm() {
  const { arcanaId } = useParams()
  const game = useGameStore((state) => state.game)
  if (!isArcanaId(arcanaId)) return <Navigate to={ROUTES.journey} replace />
  if (!game) return null

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
            return (
              <li key={gate.id}>
                {locked
                  ? <div className="rounded-lg border border-white/10 p-4 opacity-50" aria-disabled="true">
                      <span className="text-xs text-muted">Gate {gate.gateNumber} · Locked</span>
                      <strong className="mt-1 block">{gate.name}</strong>
                    </div>
                  : <Link to={ROUTES.gate(gate.id)} className={`block rounded-lg border p-4 hover:bg-white/5 ${current ? 'accent-edge accent-glow' : 'border-white/15'}`}>
                      <span className="text-xs accent-text">Gate {gate.gateNumber}{current ? ' · Current' : record?.completedAt ? ' · Completed' : ''}</span>
                      <strong className="mt-1 block">{gate.name}</strong>
                    </Link>}
              </li>
            )
          })}
        </ol>
      </Panel>
    </div>
  )
}
