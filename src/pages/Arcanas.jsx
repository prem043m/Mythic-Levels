import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { ARCANAS } from '@/data/arcanas'
import { gatesForArcana } from '@/data/catalog'
import { Panel } from '@/components/ui'

function Constellation({ states }) {
  const n = states.length
  const W = 720
  const xs = states.map((_, i) => 36 + (i * (W - 72)) / (n - 1))
  const ys = states.map((_, i) => 46 + Math.sin(i * 1.2) * 22)
  const done = states.filter((s) => s === 'Completed').length
  const line = (k) => xs.slice(0, k).map((x, i) => `${x},${ys[i]}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} 100`} className="w-full h-auto my-3" aria-hidden="true">
      <polyline points={line(n)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeDasharray="4 6" />
      {done > 0 && (
        <motion.polyline points={line(Math.min(n, done + 1))} fill="none" stroke="var(--accent)" strokeWidth="2.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      )}
      {states.map((s, i) => (
        <g key={i}>
          {s === 'Current' && <circle className="node-pulse" cx={xs[i]} cy={ys[i]} r="10" fill="var(--accent)" />}
          <circle cx={xs[i]} cy={ys[i]} r={s === 'Current' ? 9 : 7}
            fill={s === 'Completed' ? 'var(--accent)' : s === 'Locked' ? '#1b1727' : '#0d0b14'}
            stroke={s === 'Locked' ? 'rgba(255,255,255,0.2)' : 'var(--accent)'} strokeWidth="2" />
          <text x={xs[i]} y={ys[i] + 26} textAnchor="middle" fontSize="12" fill="#9a9488">{i + 1}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Arcanas() {
  const game = useGameStore((s) => s.game)
  const stateOf = (g) => {
    const rec = game.progress.gates[g.id]
    if (rec?.completedAt) return 'Completed'
    if (!rec?.unlocked) return 'Locked'
    return game.player.currentArcana === g.arcana && game.player.currentGate === g.gateNumber ? 'Current' : 'Open'
  }
  return (
    <div className="space-y-6">
      {ARCANAS.map((a) => {
        const gates = gatesForArcana(a.id)
        const states = gates.map(stateOf)
        return (
          <Panel key={a.id} className={`accent-${a.id} accent-edge`}>
            <h2 className="font-display text-2xl accent-text">{a.glyph} {a.roman} · {a.name}</h2>
            <p className="text-muted">{a.promise}</p>
            <p className="text-xs text-muted mt-1">{states.filter((s) => s === 'Completed').length}/{gates.length} Gates complete</p>
            <Constellation states={states} />
            <p className="text-sm text-muted mb-4">{a.lore}</p>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {gates.map((g, i) => {
                const st = states[i]
                const inner = (
                  <>
                    <span className="text-xl" aria-hidden="true">{st === 'Locked' ? '🔒' : g.symbol}</span>
                    <span className="block font-semibold">{g.gateNumber}. {g.name}</span>
                    <span className={`text-xs ${st === 'Current' ? 'accent-text' : 'text-muted'}`}>{st}</span>
                  </>
                )
                return (
                  <li key={g.id}>
                    {st === 'Locked'
                      ? <div className="rounded-lg border border-white/10 p-3 opacity-50" aria-disabled="true">{inner}</div>
                      : (
                        <motion.div whileHover={{ y: -3 }}>
                          <Link to={`/gate/${g.id}`} className={`block rounded-lg border p-3 bg-white/[0.02] hover:bg-white/5 ${st === 'Current' ? 'accent-edge accent-glow' : st === 'Completed' ? 'accent-edge' : 'border-white/15'}`}>{inner}</Link>
                        </motion.div>
                      )}
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
