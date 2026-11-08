import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS } from '@/data/achievements'
import { Btn } from '@/components/ui'

const RES = { xp: 'XP', mp: 'MP', sp: 'SP', ap: 'AP', dp: 'DP', kp: 'KP', cp: 'CP' }

// Full-screen reward moment. Shows only what the engine actually returned.
export default function Ceremony({ r, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const asc = r.ascension
  const title = !asc ? 'Quest Sealed' : asc.kind === 'complete' ? 'You Are the Sage' : asc.kind === 'arcana' ? 'Arcana Complete' : 'Gate Complete'
  const glyph = !asc ? '✦' : asc.kind === 'complete' ? '✧' : '☉'
  const gains = Object.entries(r.rewards).filter(([, v]) => v)

  return (
    <motion.div role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-void/85 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="panel glow-ancient relative overflow-hidden rounded-2xl p-8 max-w-md w-full text-center"
        initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}>
        {asc && <div className="ceremony-rays" aria-hidden="true" />}
        <div className="relative">
          <motion.div className="text-6xl text-ancient" aria-hidden="true"
            initial={{ rotate: -25, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}>{glyph}</motion.div>
          <h2 className="title-shimmer font-display text-3xl mt-3">{title}</h2>
          {asc && <p className="mt-2">{asc.from.name}<br /><span className="text-sm text-muted">Title earned: {asc.title}</span></p>}
          <ul className="flex flex-wrap justify-center gap-2 mt-5" aria-label="Rewards">
            {gains.map(([k, v], i) => (
              <motion.li key={k} className="rounded-full border border-ancient-dim/60 px-3 py-1 text-sm"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>+{v} {RES[k] || k.toUpperCase()}</motion.li>
            ))}
          </ul>
          <p className="text-sm text-muted mt-4">
            Level {r.level.level} · Gate mastery {Math.round(r.mastery * 100)}%
            {r.streak?.kind === 'returned' && ' · You returned. That counts.'}
          </p>
          {r.evaluation?.status === 'NEEDS_MORE_PRACTICE' && !asc && <p className="text-sm text-ember mt-3">{r.evaluation.missing[0]?.text}</p>}
          {r.achievements.map((id) => (
            <p key={id} className="text-cosmic mt-2">★ {ACHIEVEMENTS.find((a) => a.id === id)?.name || id}</p>
          ))}
          {r.unlockedGate && (
            <p className="text-sm mt-3">Unlocked: <Link onClick={onClose} className="underline text-cosmic" to={`/gate/${r.unlockedGate.id}`}>{r.unlockedGate.name}</Link></p>
          )}
          <Btn autoFocus className="mt-6" onClick={onClose}>Continue</Btn>
        </div>
      </motion.div>
    </motion.div>
  )
}
