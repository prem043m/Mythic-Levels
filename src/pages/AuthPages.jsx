import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, ERROR_TEXT } from '@/services/api/client'
import { Panel, Btn } from '@/components/ui'

const field = 'w-full rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2 text-ink'

function Frame({ title, children }) {
  return (
    <main className="mx-auto max-w-md p-6 pt-16">
      <p className="text-center font-display engraved text-ancient mb-6">✦ Mythic Levels</p>
      <Panel>
        <h1 className="font-display text-2xl text-ancient mb-3">{title}</h1>
        {children}
        <p className="mt-5 text-sm"><Link to="/" className="underline text-cosmic">Back to Mythic Levels</Link></p>
      </Panel>
    </main>
  )
}

export function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState(token ? 'idle' : 'failed')
  const confirm = async () => {
    setState('working')
    const r = await api.verify(token)
    setState(r.ok ? 'done' : r.error === 'offline' ? 'offline' : r.error === 'unauthorized' ? 'unauthorized' : 'failed')
  }
  return (
    <Frame title="Email confirmation">
      {state === 'idle' && <><p className="text-muted mb-4">When you are signed in to the account that requested this email, confirm below.</p><Btn onClick={confirm}>Confirm My Account</Btn></>}
      {state === 'working' && <p role="status" className="text-muted">Confirming…</p>}
      {state === 'done' && <><p role="status" className="text-cosmic">Your identity is confirmed. Your journey through the Arcanas can now continue.</p><Link className="inline-block mt-4 underline text-cosmic" to="/">Enter Mythic Levels</Link></>}
      {state === 'offline' && <p role="alert" className="text-ember">{ERROR_TEXT.offline}</p>}
      {state === 'unauthorized' && <p role="alert" className="text-ember">{ERROR_TEXT.unauthorized} Sign in to the matching account, then open this link again.</p>}
      {state === 'failed' && <p role="alert" className="text-ember">{ERROR_TEXT['invalid-or-expired']} You can resend it from Settings → Account.</p>}
    </Frame>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    const r = await api.forgot(email)
    setState(r.ok ? 'sent' : r.error)
  }
  return (
    <Frame title="Forgot your password?">
      {state === 'sent' ? (
        <p role="status" className="text-cosmic">If an account exists for that address, a reset link is on its way. It expires in 1 hour.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-muted">Enter the email on your account and we’ll send a reset link.</p>
          <input aria-label="Email" type="email" required autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Btn type="submit" disabled={state === 'sending'}>Send reset link</Btn>
          {!['idle', 'sending'].includes(state) && <p role="alert" className="text-ember text-sm">{ERROR_TEXT[state] || 'Something went wrong.'}</p>}
        </form>
      )}
    </Frame>
  )
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [state, setState] = useState('idle')
  const mismatch = pw2 && pw !== pw2
  const submit = async (e) => {
    e.preventDefault()
    if (pw !== pw2) return
    const r = await api.reset(token, pw)
    setState(r.ok ? 'done' : r.error)
  }
  return (
    <Frame title="Choose a new password">
      {state === 'done' ? (
        <p role="status" className="text-cosmic">Password changed and all devices signed out. You can now sign in under Settings → Account.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input aria-label="New password" type="password" autoComplete="new-password" minLength={8} required className={field} placeholder="New password (8+ chars)" value={pw} onChange={(e) => setPw(e.target.value)} />
          <input aria-label="Repeat new password" type="password" autoComplete="new-password" required className={field} placeholder="Repeat password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          {mismatch && <p role="alert" className="text-ember text-sm">Passwords do not match.</p>}
          <Btn type="submit" disabled={!token || mismatch}>Change password</Btn>
          {!['idle', 'done'].includes(state) && <p role="alert" className="text-ember text-sm">{ERROR_TEXT[state] || 'Something went wrong.'}</p>}
          {!token && <p role="alert" className="text-ember text-sm">{ERROR_TEXT['invalid-or-expired']}</p>}
        </form>
      )}
    </Frame>
  )
}
