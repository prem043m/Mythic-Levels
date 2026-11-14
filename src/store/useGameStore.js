import { create } from 'zustand'
import { createStorage, createLocalStorageAdapter } from '@/services/storage/storage'
import {
  createInitialState, completeQuest, enterGate, upsertReflection,
  deleteReflection, saveDailyPlan, validateLoadedState, ritualAction, reviseEvidence,
} from '@/services/progression/engine'
import { applySettings } from '@/services/settings/settings'
import { api, getAuth, setAuth } from '@/services/api/client'
import { todayKey } from '@/utils/dates'

const storage = createStorage(createLocalStorageAdapter())
let pushTimer

// Older saves may hold a duplicated achievement id (engine bug, now fixed). Clean on the way in.
const dedupe = (state) => {
  const list = state.player.achievements
  return new Set(list).size === list.length ? state : { ...state, player: { ...state.player, achievements: [...new Set(list)] } }
}

export const useGameStore = create((set, get) => ({
  game: null,
  status: 'loading', // loading | new | ready | error
  loadError: null,
  lastResult: null,
  saveError: false,
  auth: getAuth(), // { token, username, syncReady } | null
  sync: { status: 'idle', at: null, error: null },

  load() {
    const res = storage.load()
    if (!res.ok) return set({ status: 'error', loadError: res.error })
    if (!res.data) return set({ status: 'new' })
    if (!validateLoadedState(res.data)) return set({ status: 'error', loadError: 'invalid' })
    set({ game: dedupe(res.data), status: 'ready' })
  },
  commit(state, { sync = true } = {}) {
    const next = dedupe(state)
    const saved = storage.save(next)
    set({ game: next, status: 'ready', saveError: !saved.ok })
    const { auth } = get()
    if (sync && auth?.syncReady && get().sync.status !== 'conflict') {
      clearTimeout(pushTimer)
      pushTimer = setTimeout(() => get().push(), 1500)
    }
  },
  awaken(input) { get().commit(createInitialState(input)) },
  // `input` is a guided submission ({ submission: {...} }) or, for older callers, a plain reflection string.
  complete(gateId, questId, input, durationMinutes) {
    const { game, commit } = get()
    const payload = typeof input === 'string' ? { reflection: input } : input
    // Date always comes from the local clock, never from the UI.
    const res = completeQuest(game, { gateId, questId, ...payload, durationMinutes, dateKey: todayKey() })
    if (res.ok) { commit(res.state); set({ lastResult: res }) }
    else if (res.error === 'not-accepted') commit(res.state) // keep the draft so feedback and attempts survive a reload
    return res
  },
  enter(gateId) {
    const res = enterGate(get().game, gateId)
    if (res.ok) get().commit(res.state)
    return res
  },
  addReflection(text, gateId) {
    const res = upsertReflection(get().game, { text, gateId })
    if (res.ok) get().commit(res.state)
  },
  removeReflection(id) { get().commit(deleteReflection(get().game, id).state) },
  savePlan(plan) { get().commit(saveDailyPlan(get().game, { dateKey: plan.dateKey, plan }).state) },
  updateSettings(patch) { get().commit(applySettings(get().game, patch)) },
  ritual(gateId, action, payload) {
    const res = ritualAction(get().game, { gateId, action, payload, now: Date.now(), dateKey: todayKey() })
    if (res.ok) {
      get().commit(res.state)
      if (action === 'finish') set({ lastResult: res })
    }
    return res
  },
  revise(gateId, day, text) {
    const res = reviseEvidence(get().game, { gateId, day, text })
    if (res.ok) {
      get().commit(res.state)
      if (res.ascension) set({ lastResult: res })
    }
    return res
  },
  clearResult() { set({ lastResult: null }) },
  exportJson() { return JSON.stringify(get().game, null, 2) },
  importSave(text) {
    let data
    try { data = JSON.parse(text) } catch { return { ok: false, error: 'not-json' } }
    if (!validateLoadedState(data)) return { ok: false, error: 'invalid-save' }
    get().commit(data)
    return { ok: true }
  },
  reset() {
    clearTimeout(pushTimer)
    storage.clear()
    set({ game: null, status: 'new', lastResult: null })
  },

  // ---- account + sync -------------------------------------------------------
  async signIn(mode, username, password, email) {
    const r = await api.auth(mode, username, password, email)
    if (!r.ok) return r
    const auth = { token: r.token, username: r.username, syncReady: false }
    setAuth(auth)
    set({ auth, sync: { status: 'idle', at: null, error: null } })
    return r
  },
  async signOut() {
    clearTimeout(pushTimer)
    await api.logout()
    setAuth(null)
    set({ auth: null, sync: { status: 'idle', at: null, error: null } })
  },
  _markReady(patch = {}) {
    const auth = { ...get().auth, syncReady: true, ...patch }
    setAuth(auth)
    set({ auth })
  },
  _fail(r) {
    if (r.status === 401) { setAuth(null); set({ auth: null }) }
    set({ sync: { status: 'error', at: null, error: r.error } })
    return r
  },
  async push(force = false) {
    const { auth, game } = get()
    if (!auth || !game) return { ok: false, error: 'unauthorized' }
    set({ sync: { status: 'syncing', at: null, error: null } })
    const r = await api.putSave(game, auth.revision ?? 0, force)
    if (r.status === 409) { set({ sync: { status: 'conflict', at: r.updatedAt, error: 'conflict' } }); return r }
    if (!r.ok) return get()._fail(r)
    get()._markReady({ revision: r.revision })
    set({ sync: { status: 'ok', at: r.updatedAt, error: null } })
    return r
  },
  resolveConflict(choice) { return choice === 'mine' ? get().push(true) : get().pull() },
  async pull() {
    set({ sync: { status: 'syncing', at: null, error: null } })
    const r = await api.getSave()
    if (!r.ok) return get()._fail(r)
    if (!r.state) { get()._markReady({ revision: 0 }); set({ sync: { status: 'ok', at: null, error: null } }); return { ok: true, empty: true } }
    if (!validateLoadedState(r.state)) return get()._fail({ error: 'invalid-state' })
    get().commit(r.state, { sync: false })
    get()._markReady({ revision: r.revision })
    set({ sync: { status: 'ok', at: r.updatedAt, error: null } })
    return r
  },
}))
