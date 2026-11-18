import { motion } from 'framer-motion'

// Gate seal: a ring of tick marks, a progress arc tied to real mastery, and the Gate's own symbol.
export default function Emblem({ symbol, value = 0, size = 96, label, children }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} aria-hidden="true">
        <g transform={`translate(${size / 2} ${size / 2})`} stroke="var(--accent, var(--color-ancient))" opacity="0.5">
          {ticks.map((a) => <line key={a} x1="0" y1={-(r + 6)} x2="0" y2={-(r + (a % 45 === 0 ? 1 : 3))} transform={`rotate(${a})`} />)}
        </g>
        <circle cx={size / 2} cy={size / 2} r={r - 4} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <motion.circle cx={size / 2} cy={size / 2} r={r - 4} fill="none" stroke="var(--accent, var(--color-ancient))" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} transform={`rotate(-90 ${size / 2} ${size / 2})`} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }} transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-3xl" aria-hidden={!children}>{children || symbol}</div>
    </div>
  )
}
