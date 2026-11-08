import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

export const Panel = ({ className = '', children, ...rest }) => (
  <motion.section
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className={`panel rounded-xl p-5 ${className}`}
    {...rest}
  >
    {children}
  </motion.section>
)

export const H = ({ children, className = '' }) => (
  <h2 className={`rune-rule font-display text-ancient engraved text-sm mb-4 ${className}`}>{children}</h2>
)

export const Btn = ({ variant = 'primary', className = '', ...p }) => (
  <motion.button
    whileHover={p.disabled ? undefined : { y: -1 }}
    whileTap={p.disabled ? undefined : { scale: 0.97 }}
    {...p}
    className={`rounded-lg px-4 py-2 font-semibold transition-shadow disabled:opacity-40 disabled:cursor-not-allowed ${
      variant === 'primary'
        ? 'bg-gradient-to-b from-[#e0c383] to-ancient text-void hover:shadow-[0_0_18px_rgba(200,169,107,0.45)]'
        : 'border border-ancient-dim text-ink hover:border-ancient hover:bg-white/5'
    } ${className}`}
  />
)

export const Bar = ({ value, label, className = '' }) => {
  const pct = Math.round(Math.min(1, Math.max(0, value || 0)) * 100)
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
      className={`h-2 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <motion.div className="h-full rounded-full bg-gradient-to-r from-mystic to-cosmic"
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
    </div>
  )
}

export function Ring({ value, size = 104, label, children }) {
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  const v = Math.min(1, Math.max(0, value || 0))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-ancient)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }} transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

const links = [['/dashboard', 'Dashboard'], ['/plan', 'Plan'], ['/arcanas', 'Arcanas'], ['/coach', 'Coach'], ['/journal', 'Journal'], ['/analytics', 'Analytics'], ['/profile', 'Profile'], ['/settings', 'Settings']]

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ancient-dim/30 bg-obsidian/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto max-w-5xl flex items-center gap-x-5 px-4 py-3 overflow-x-auto">
        <span className="font-display engraved text-ancient whitespace-nowrap mr-auto"><span aria-hidden="true">✦ </span>Mythic Levels</span>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `relative text-sm whitespace-nowrap py-1 ${isActive ? 'text-ancient' : 'text-muted hover:text-ink'}`}>
            {({ isActive }) => (
              <>
                {label}
                {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-ancient" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
