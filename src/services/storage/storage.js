import { SCHEMA_VERSION, STORAGE_KEY } from '@/config/constants'

export function createMemoryAdapter(initial = {}) {
  const store = { ...initial }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    },
    setItem(key, value) {
      store[key] = value
    },
    removeItem(key) {
      delete store[key]
    },
  }
}

export function createLocalStorageAdapter() {
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem(key, value) {
      window.localStorage.setItem(key, value)
    },
    removeItem(key) {
      window.localStorage.removeItem(key)
    },
  }
}

export function createStorage(adapter) {
  return {
    load() {
      const raw = adapter.getItem(STORAGE_KEY)
      if (!raw) return { ok: true, data: null }
      try {
        const parsed = JSON.parse(raw)
        if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
          return { ok: false, error: 'unsupported-schema', data: parsed }
        }
        return { ok: true, data: parsed }
      } catch {
        return { ok: false, error: 'corrupt', data: null }
      }
    },
    save(state) {
      try {
        adapter.setItem(STORAGE_KEY, JSON.stringify(state))
        return { ok: true }
      } catch {
        return { ok: false, error: 'persist-failed' }
      }
    },
    clear() {
      adapter.removeItem(STORAGE_KEY)
    },
  }
}
