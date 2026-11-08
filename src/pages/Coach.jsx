import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { api, ERROR_TEXT } from '@/services/api/client'
import { Panel, Btn } from '@/components/ui'

const gateOf = (p) => `${p.currentArcana}-${String(p.currentGate).padStart(2, '0')}`

export default function Coach() {
  const { auth, game } = useGameStore()
  const [verified, setVerified] = useState(null)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [thread, setThread] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!auth) return undefined
    let active = true
    const refresh = () => api.me().then((r) => active && setVerified(r.ok ? r.verified : false))
    refresh()
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh) }
  }, [auth])

  if (!auth)
    return <Panel><h1 className="font-display text-2xl text-ancient mb-2">Coach</h1>
      <p className="text-muted">The coach answers from the Gates’ own teachings and needs the backend. <Link to="/settings" className="underline text-cosmic">Sign in under Settings → Account</Link>.</p></Panel>

  if (verified === false)
    return <Panel><h1 className="font-display text-2xl text-ancient mb-2">Coach locked</h1>
      <p className="text-muted">Confirm your email to unlock the Coach. <Link to="/settings" className="underline text-cosmic">Open Settings → Account</Link></p></Panel>

  const ask = async (e) => {
    e.preventDefault()
    if (busy || q.trim().length < 3) return
    setBusy(true); setError(null)
    const question = q.trim()
    const r = await api.coach(question, gateOf(game.player))
    setBusy(false)
    if (!r.ok) return setError(ERROR_TEXT[r.error] || 'Something went wrong.')
    setThread((t) => [{ question, answer: r.answer, sources: r.sources }, ...t])
    setQ('')
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-ancient">Coach</h1>
      <form onSubmit={ask} className="flex gap-2">
        <input aria-label="Ask the coach" className="flex-1 rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2" placeholder="How do I stop reacting so quickly?" maxLength={500} value={q} onChange={(e) => setQ(e.target.value)} />
        <Btn type="submit" disabled={busy}>{busy ? 'Searching…' : 'Ask'}</Btn>
      </form>
      {error && <p role="alert" className="text-ember">{error}</p>}
      {thread.map((m, i) => (
        <Panel key={i}>
          <p className="font-display mb-2">{m.question}</p>
          <p className="whitespace-pre-wrap">{m.answer}</p>
          {m.sources.length > 0 && (
            <p className="text-xs text-muted mt-3">Sources: {m.sources.map((s, j) => (
              <span key={s.id}>{j > 0 && ' · '}<Link className="underline text-cosmic" to={`/gate/${s.gateId}`}>{s.label}</Link></span>))}</p>
          )}
        </Panel>
      ))}
    </div>
  )
}
