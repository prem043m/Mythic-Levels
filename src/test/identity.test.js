import { describe, expect, it } from 'vitest'
import { listGates } from '@/data/catalog'
import { ARCANA_ASSETS, GATE_ASSETS } from '@/data/identityAssets'

describe('progression identity registry', () => {
  it('covers every canonical Arcana and Gate identity', () => {
    expect(Object.keys(ARCANA_ASSETS).sort()).toEqual(['beast', 'human', 'sage'])
    expect(Object.keys(GATE_ASSETS).sort()).toEqual(listGates().map((gate) => gate.id).sort())
    expect(Object.values(ARCANA_ASSETS).every((path) => path.startsWith('/assets/'))).toBe(true)
    expect(Object.values(GATE_ASSETS).every((path) => path.startsWith('/assets/'))).toBe(true)
  })
})
