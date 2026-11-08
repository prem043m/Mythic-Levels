import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { DIFFICULTY } from '@/config/constants'
import { DAY_IDS } from '@/services/settings/settings'
import { api, ERROR_TEXT } from '@/services/api/client'
import { Panel, H, Btn } from '@/components/ui'

const field = 'rounded-lg bg-obsidian-2 border border-ancient-dim/40 px-3 py-2 text-ink'
const DURATIONS = [15, 20, 25, 30, 45, 60, 90]

function Account() {
  const { auth, sync, signIn, signOut, push, pull, resolveConflict } = useGameStore()
  const [mode, setMode] = useState('login')
  const [u, setU] = useState('')
  const [em, setEm] = useState('')
  const [p, setP] = useState('')
  const [msg, setMsg] = useState(null)
  const [me, setMe] = useState(null)
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeMsg, setCodeMsg] = useState(null)

  useEffect(() => {
    if (!auth) return
    const refresh = () => api.me().then((r) => r.ok && setMe(r))
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [auth])

  const fail = (r) => setMsg(ERROR_TEXT[r.error] || 'Something went wrong.')
  const submit = async (e) => {
    e.preventDefault(); setMsg(null)
    const r = await signIn(mode, u, p, em)
    if (!r.ok) fail(r)
    else { setP(''); if (mode === 'register') setMsg('Account created. Check your inbox to confirm your email.') }
  }
  const download = async () => {
    if (!confirm('Replace the progress on this device with the server copy?')) return
    const r = await pull()
    setMsg(r.ok ? (r.empty ? 'No save on the server yet.' : 'Downloaded.') : ERROR_TEXT[r.error])
  }
  const resend = async () => {
    const r = await api.resend()
    if (r.ok) setMsg(r.alreadyVerified ? 'Your email is already verified.' : 'Verification email sent.')
    else setMsg(ERROR_TEXT[r.error] || 'Could not send.')
  }
  const verifyCode = async (e) => {
    e.preventDefault()
    const r = await api.verifyOtp(code)
    if (r.ok) { setMe({ ...me, verified: true }); setCode(''); setCodeMsg('Your identity is confirmed. The Coach is unlocked.') }
    else setCodeMsg(ERROR_TEXT[r.error] || 'Could not verify that code.')
  }
  const changeEmail = async (e) => {
    e.preventDefault()
    const r = await api.setEmail(newEmail)
    if (!r.ok) return fail(r)
    setMe({ ...me, email: r.email, verified: false }); setNewEmail(''); setMsg('Check your inbox to confirm the new address.')
  }

  if (!auth)
    return (
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-muted">Optional. An account backs up your progress and unlocks the Coach. The game works fully without one.</p>
        <div className="flex flex-wrap gap-2">
          <input aria-label={mode === 'login' ? 'Username or email' : 'Username'} autoComplete="username" className={field} placeholder={mode === 'login' ? 'Username or email' : 'Username'} value={u} onChange={(e) => setU(e.target.value)} />
          {mode === 'register' && <input aria-label="Email" type="email" autoComplete="email" className={field} placeholder="Email" value={em} onChange={(e) => setEm(e.target.value)} />}
          <input aria-label="Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={field} placeholder="Password (8+ chars)" value={p} onChange={(e) => setP(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Btn type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</Btn>
          <Btn type="button" variant="ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'New here? Create account' : 'Have an account? Sign in'}</Btn>
          {mode === 'login' && <Link to="/forgot" className="text-sm underline text-cosmic">Forgot password?</Link>}
        </div>
        {msg && <p role="alert" className="text-ember text-sm">{msg}</p>}
      </form>
    )
  return (
    <div className="space-y-3">
      <p>Signed in as <b>{auth.username}</b>. {auth.syncReady ? 'Changes upload automatically.' : 'Auto-sync starts after your first upload or download on this device.'}</p>
      {me && (
        <div className="text-sm">
          {me.email
            ? <>{<p>{me.email} · {me.verified ? <span className="text-cosmic">Verified ✓</span> : <><span className="text-ember">Not verified</span> <button type="button" className="underline text-cosmic" onClick={resend}>Resend email</button></>}</p>}
              {!me.verified && <form onSubmit={verifyCode} className="flex flex-wrap gap-2 mt-2">
                <input aria-label="Verification code" inputMode="numeric" pattern="\d{6}" maxLength={6} required className={field} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                <Btn type="submit" variant="ghost">Verify code</Btn>
                {codeMsg && <p role="status" className="w-full text-sm text-muted">{codeMsg}</p>}
              </form>}</>
            : <p className="text-ember">No email on this account. Add one to verify it and enable password recovery.</p>}
          <details className="mt-1"><summary className="cursor-pointer text-muted">{me.email ? 'Change email' : 'Add email'}</summary>
            <form onSubmit={changeEmail} className="flex gap-2 mt-2">
              <input aria-label="New email" type="email" className={field} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <Btn type="submit" variant="ghost">Save</Btn>
            </form></details>
        </div>
      )}
      <p className="text-sm text-muted" role="status">
        {sync.status === 'syncing' && 'Syncing…'}
        {sync.status === 'ok' && (sync.at ? `Last synced ${new Date(sync.at).toLocaleString()}` : 'Up to date.')}
        {sync.status === 'conflict' && <span className="text-ember">{ERROR_TEXT.conflict}</span>}
        {sync.status === 'error' && <span className="text-ember">{ERROR_TEXT[sync.error] || 'Sync failed.'}</span>}
      </p>
      {sync.status === 'conflict' && (
        <div className="rounded-lg border border-ember/50 p-3 space-y-2" role="alert">
          <p className="text-sm">Your server copy changed since this device last synced. Nothing has been overwritten. Pick one:</p>
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => confirm('Overwrite the server copy with this device’s progress?') && resolveConflict('mine')}>Keep this device’s progress</Btn>
            <Btn variant="ghost" onClick={() => confirm('Replace this device’s progress with the server copy?') && resolveConflict('server')}>Use the server’s progress</Btn>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => push()}>Upload this device’s progress</Btn>
        <Btn variant="ghost" onClick={download}>Download server copy</Btn>
        <Btn variant="ghost" onClick={signOut}>Sign out</Btn>
      </div>
      {msg && <p className="text-sm text-muted" role="status">{msg}</p>}
    </div>
  )
}

export default function Settings() {
  const { game, updateSettings, exportJson, importSave, reset } = useGameStore()
  const s = game.settings
  const [note, setNote] = useState(null)
  const durations = DURATIONS.includes(s.dailyDuration) ? DURATIONS : [...DURATIONS, s.dailyDuration].sort((a, b) => a - b)
  const toggleDay = (d) => {
    const next = s.availableDays.includes(d) ? s.availableDays.filter((x) => x !== d) : [...s.availableDays, d]
    if (next.length) updateSettings({ availableDays: next })
  }
  const toggleReminders = async (on) => {
    setNote(null)
    if (!on) return updateSettings({ reminders: false })
    if (typeof Notification === 'undefined') return setNote('This browser does not support notifications.')
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    if (perm !== 'granted') return setNote('Notifications are blocked. Allow them in your browser settings to use reminders.')
    updateSettings({ reminders: true })
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: 'mythic-levels-save.json' }).click()
    URL.revokeObjectURL(url)
  }
  const onImport = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !confirm('Replace all progress on this device with this file?')) return
    const r = importSave(await file.text())
    setNote(r.ok ? 'Save imported.' : 'That file is not a valid Mythic Levels save.')
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-ancient">Settings</h1>
      <Panel><H>Practice</H>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">Difficulty
            <select className={`${field} w-full mt-1`} value={s.difficulty} onChange={(e) => updateSettings({ difficulty: e.target.value })}>
              {Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select></label>
          <label className="block text-sm">Minutes per day
            <select className={`${field} w-full mt-1`} value={s.dailyDuration} onChange={(e) => updateSettings({ dailyDuration: e.target.value })}>
              {durations.map((d) => <option key={d} value={d}>{d}</option>)}
            </select></label>
        </div>
        <fieldset className="mt-4"><legend className="text-sm mb-2">Practice days (others are rest days)</legend>
          <div className="flex flex-wrap gap-2">{DAY_IDS.map((d) => (
            <label key={d} className={`cursor-pointer rounded-full border px-3 py-1 text-sm capitalize ${s.availableDays.includes(d) ? 'border-mystic bg-mystic/20' : 'border-ancient-dim/40'}`}>
              <input type="checkbox" className="sr-only" checked={s.availableDays.includes(d)} onChange={() => toggleDay(d)} />{d}</label>))}
          </div></fieldset>
        <p className="text-xs text-muted mt-3">Difficulty changes XP and duration for quests you complete from now on.</p>
      </Panel>
      <Panel><H>Reminders</H>
        <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(s.reminders)} onChange={(e) => toggleReminders(e.target.checked)} /> Remind me to practice</label>
        <label className="block text-sm mt-3">Time
          <input type="time" className={`${field} ml-2`} value={s.reminderTime || '18:00'} onChange={(e) => updateSettings({ reminderTime: e.target.value })} /></label>
        <p className="text-xs text-muted mt-2">Reminders are browser notifications and only fire while this app is open in a tab.</p>
        {note && <p role="status" className="text-sm text-ember mt-2">{note}</p>}
      </Panel>
      <Panel><H>Account & sync</H><Account /></Panel>
      <Panel><H>Your data</H>
        <div className="flex flex-wrap gap-2 items-center">
          <Btn variant="ghost" onClick={download}>Export save</Btn>
          <label className="cursor-pointer rounded-lg border border-ancient-dim px-4 py-2 font-semibold hover:border-ancient">Import save
            <input type="file" accept="application/json,.json" className="sr-only" onChange={onImport} /></label>
          <Btn variant="ghost" onClick={() => confirm('This permanently erases all progress on this device. Continue?') && reset()}>Erase all progress</Btn>
        </div></Panel>
    </div>
  )
}
