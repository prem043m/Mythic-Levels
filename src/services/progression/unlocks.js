import { ARCANA_ORDER } from '@/config/constants'
import { getGateById, getGateByPosition, listGates } from '@/data/catalog'

export function nextGatePosition(arcana, gateNumber) {
  if (gateNumber < 9) {
    return { arcana, gateNumber: gateNumber + 1 }
  }
  const index = ARCANA_ORDER.indexOf(arcana)
  if (index < ARCANA_ORDER.length - 1) {
    return { arcana: ARCANA_ORDER[index + 1], gateNumber: 1 }
  }
  return null
}

export function canUnlockGate(state, gateId) {
  const gate = getGateById(gateId)
  if (!gate) return false
  if (gate.arcana === 'beast' && gate.gateNumber === 1) return true

  const previous = previousGate(gate)
  if (!previous) return false
  const progress = state.progress.gates[previous.id]
  return Boolean(progress?.completedAt)
}

export function previousGate(gate) {
  if (gate.gateNumber > 1) {
    return getGateByPosition(gate.arcana, gate.gateNumber - 1)
  }
  const index = ARCANA_ORDER.indexOf(gate.arcana)
  if (index <= 0) return null
  return getGateByPosition(ARCANA_ORDER[index - 1], 9)
}

export function unlockableGates(state) {
  return listGates().filter((gate) => canUnlockGate(state, gate.id))
}
