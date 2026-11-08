import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { ERROR_TEXT } from '@/services/api/client'
import { Panel, H, Btn } from '@/components/ui'

const field = 'w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2 text-ink'

// Restore an existing journey on a new device: from a JSON file, or from the server.
export default function Restore() {
  const { importSave, signIn, pull } = useGameStore()
  const nav = useNavigate()
  const [msg, setMsg] = useState(null)
  const [u, setU] = useState('')
  const [p, setP] = useState('')

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = importSave(await file.text())
    if (r.ok) nav('/dashboard'); else setMsg('That file is not a valid Mythic Levels save.')
  }
  const fromServer = async (e) => {
    e.preventDefault()
    setMsg(null)
    const s = await signIn('login', u, p)
    if (!s.ok) return setMsg(ERROR_TEXT[s.error] || 'Could not sign in.')
    const r = await pull()
    if (!r.ok) return setMsg(ERROR_TEXT[r.error] || 'Could not download your save.')
    if (r.empty) return setMsg('Signed in, but no save is stored on the server yet.')
    nav('/dashboard')
  }
  return (
    <Panel className="mt-6">
      <H>Already walking this path?</H>
      <label className="block text-sm mb-4">Restore from a save file
        <input type="file" accept="application/json,.json" onChange={onFile} className="block mt-1 text-sm" />
      </label>
      <form onSubmit={fromServer} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input aria-label="Username" autoComplete="username" className={field} placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
        <input aria-label="Password" type="password" autoComplete="current-password" className={field} placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} />
        <Btn type="submit" variant="ghost">Restore from server</Btn>
      </form>
      <p className="text-xs mt-2"><Link to="/forgot" className="underline text-cosmic">Forgot your password?</Link></p>
      {msg && <p role="alert" className="text-ember text-sm mt-2">{msg}</p>}
    </Panel>
  )
}
