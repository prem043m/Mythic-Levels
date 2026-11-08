import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { ARCANAS } from '@/data/arcanas'

export default function Home() {
  const status = useGameStore((s) => s.status)
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-center">
      <motion.div className="text-6xl text-ancient" aria-hidden="true" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>✦</motion.div>
      <motion.h1 className="title-shimmer font-display engraved text-4xl md:text-6xl mt-4 mb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        Mythic Levels
      </motion.h1>
      <motion.p className="text-lg text-balance text-muted max-w-2xl mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
        Twenty-seven Gates across three Arcanas. Train attention, discipline, wisdom — through real action, not interface activity.
      </motion.p>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
        <Link to="/awakening" className="inline-block rounded-lg bg-gradient-to-b from-[#e0c383] to-ancient text-void font-semibold px-8 py-3 shadow-[0_0_24px_rgba(200,169,107,0.35)]">
          {status === 'new' ? 'Begin the Awakening' : 'Enter'}
        </Link>
      </motion.div>
      <div className="grid gap-4 mt-16 md:grid-cols-3 text-left">
        {ARCANAS.map((a, i) => (
          <motion.div key={a.id} className={`panel accent-${a.id} accent-edge rounded-xl p-5`}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }} whileHover={{ y: -4 }}>
            <div className="text-3xl accent-text" aria-hidden="true">{a.glyph}</div>
            <h2 className="font-display text-ancient mt-1">{a.roman} · {a.name}</h2>
            <p className="text-sm text-muted mt-2">{a.promise}</p>
          </motion.div>
        ))}
      </div>
    </main>
  )
}
