import { useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { levelFromXp } from '@/services/progression/xp'
import { ATTRIBUTES } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { Bar } from '@/components/ui'

const primary = [
  ['/dashboard', 'The World', 'Current state', '◈'],
  [ROUTES.journey, 'The Journey', 'Three Arcanas · 27 Gates', '✦'],
  [ROUTES.quests, 'The Quests', 'Daily practice', '◇'],
]
const inner = [
  ['/journal', 'The Chronicle', 'Journal', '▧'],
  ['/coach', 'The Guide', 'Wisdom on the path', '✧'],
  ['/analytics', 'The Records', 'Patterns and streaks', '◌'],
]
const sanctum = [
  ['/settings', 'Settings', 'Preferences and sync', '⚙'],
  ['/profile', 'Seeker Identity', 'Profile and account', '♙'],
]

function NavGroup({ title, links, onNavigate }) {
  return (
    <div className="world-nav-group">
      <p className="world-nav-label">{title}</p>
      {links.map(([to, label, subtitle, glyph]) => (
        <NavLink key={to} to={to} title={label} onClick={onNavigate} className={({ isActive }) => `world-nav-item ${isActive ? 'is-active' : ''}`}>
          <span className="world-nav-glyph" aria-hidden="true">{glyph}</span>
          <span><strong>{label}</strong><small>{subtitle}</small></span>
        </NavLink>
      ))}
    </div>
  )
}

export function WorldSidebar({ open, onClose }) {
  return (
    <>
      {open && <button className="world-scrim md:hidden" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`world-sidebar ${open ? 'is-open' : ''}`}>
        <div className="world-brand">
          <span className="world-brand-mark" aria-hidden="true">✦</span>
          <span><strong>MYTHIC</strong><small>LEVELS</small></span>
        </div>
        <NavGroup title="The World" links={primary} onNavigate={onClose} />
        <NavGroup title="The Inner Court" links={inner} onNavigate={onClose} />
        <NavGroup title="The Sanctum" links={sanctum} onNavigate={onClose} />
      </aside>
    </>
  )
}

export function WorldHeader({ onMenu, onProfile }) {
  const game = useGameStore((s) => s.game)
  const player = game?.player
  const level = player ? levelFromXp(player.xp) : null
  return (
    <header className="world-header">
      <button className="world-menu md:hidden" onClick={onMenu} aria-label="Open navigation">☰</button>
      <div className="world-header-spacer" />
      <button className="world-notification" aria-label="Notifications">◌<span /></button>
      {player && <Link to="/profile" onClick={onProfile} className="world-header-seeker">
        <span className="world-avatar">{player.avatar === 'lantern' ? '✦' : player.avatar === 'quill' ? '✐' : '◈'}</span>
        <span><strong>{player.name}</strong><small>Level {level.level}</small></span>
      </Link>}
    </header>
  )
}

export function SeekerPanel() {
  const game = useGameStore((s) => s.game)
  const [collapsed, setCollapsed] = useState(false)
  if (!game) return null
  const { player } = game
  const level = levelFromXp(player.xp)
  const progress = level.toNext ? level.intoLevel / level.toNext : 0
  return (
    <aside className={`seeker-panel ${collapsed ? 'is-collapsed' : ''}`}>
      <button className="seeker-collapse" onClick={() => setCollapsed((v) => !v)} aria-expanded={!collapsed}>
        {collapsed ? '‹' : '›'}
      </button>
      {!collapsed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="seeker-crest">✦</div>
        <p className="world-eyebrow">Seeker identity</p>
        <h2 className="seeker-name">{player.name}</h2>
        <p className="seeker-title">{player.title}</p>
        <div className="seeker-level"><strong>LEVEL {level.level}</strong><span>{level.intoLevel} / {level.toNext} XP</span></div>
        <Bar value={progress} label="Experience progress" className="world-xp-bar" />
        <p className="world-eyebrow seeker-section-title">Attributes</p>
        <div className="attribute-list">
          {ATTRIBUTES.slice(0, 6).map((attribute) => <div key={attribute.id} className="attribute-row">
            <span>{attribute.label}</span><strong>{player.attributes[attribute.id] || 0}</strong>
          </div>)}
        </div>
        <div className="milestone-box"><span>Next milestone</span><strong>{level.toNext - level.intoLevel} XP to level {level.level + 1}</strong></div>
      </motion.div>}
    </aside>
  )
}

const shelllessPaths = ['/ritual/', '/verify', '/forgot', '/reset', '/awakening']

function isShellless(pathname) {
  return shelllessPaths.some((path) => path.endsWith('/') ? pathname.startsWith(path) : pathname === path)
}

function isDense(pathname) {
  return pathname === '/settings' || pathname === '/quests' || pathname === '/journal' || pathname.startsWith('/ritual/')
}

export function WorldLayout({ children }) {
  const [menu, setMenu] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  if (isShellless(location.pathname)) return children || <Outlet />
  return (
    <div className={`world-layout ${collapsed ? 'sidebar-collapsed' : ''} ${isDense(location.pathname) ? 'is-dense' : ''}`}>
      <WorldSidebar open={menu} onClose={() => setMenu(false)} />
      <div className="world-stage">
        <WorldHeader onMenu={() => setMenu(true)} onProfile={() => setMenu(false)} />
        <main className="world-content">{children || <Outlet />}</main>
      </div>
      {!isDense(location.pathname) && <SeekerPanel />}
      <nav className="world-bottom-nav" aria-label="Mobile navigation">
        <NavLink to="/dashboard"><span>◈</span>World</NavLink>
        <NavLink to={ROUTES.journey}><span>✦</span>Journey</NavLink>
        <NavLink to={ROUTES.quests}><span>◇</span>Quests</NavLink>
        <NavLink to="/profile"><span>♙</span>Player</NavLink>
      </nav>
      <button
        type="button"
        className="world-sidebar-toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </div>
  )
}

export default WorldLayout
