import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { Panel, Btn } from '@/components/ui'
import Home from '@/pages/Home'
import Awakening from '@/pages/Awakening'
import Dashboard from '@/pages/Dashboard'
import Arcanas from '@/pages/Arcanas'
import Gate from '@/pages/Gate'
import Plan from '@/pages/Plan'
import Ritual from '@/pages/Ritual'
import Coach from '@/pages/Coach'
import Settings from '@/pages/Settings'
import { VerifyEmail, ForgotPassword, ResetPassword } from '@/pages/AuthPages'
import { useReminder } from '@/hooks/useReminder'
import { Journal, Analytics, Profile } from '@/pages/Others'

function Shell() {
  const { status, saveError, loadError, reset, game } = useGameStore()
  useReminder(game?.settings)
  if (status === 'loading') return <p className="p-8 text-muted">Opening the gate…</p>
  if (status === 'error')
    return (
      <main className="mx-auto max-w-xl p-8">
        <Panel>
          <h1 className="font-display text-xl text-ember mb-2">Your save could not be read</h1>
          <p className="text-muted mb-4">Reason: {loadError}. Your stored data has not been touched. Start fresh only if you accept losing it.</p>
          <Btn variant="ghost" onClick={() => confirm('Erase the unreadable save?') && reset()}>Start fresh</Btn>
        </Panel>
      </main>
    )
  if (status === 'new') return <Navigate to="/awakening" replace />
  return (
    <>
      {saveError && <p role="alert" className="bg-ember/20 text-ember text-center text-sm py-2">Progress could not be saved to this browser. Export your save from Profile.</p>}
      <Outlet />
    </>
  )
}

export default function App() {
  const load = useGameStore((s) => s.load)
  const status = useGameStore((s) => s.status)
  useEffect(() => { load() }, [load])
  return (
    <MotionConfig reducedMotion="user">
    <HashRouter>
      <Routes>
        <Route path="/" element={status === 'ready' ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/awakening" element={status === 'ready' ? <Navigate to="/dashboard" replace /> : <Awakening />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/arcanas" element={<Arcanas />} />
          <Route path="/gate/:gateId" element={<Gate />} />
          <Route path="/ritual/:gateId" element={<Ritual />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
    </MotionConfig>
  )
}
