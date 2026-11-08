import { ARCANAS } from '@/data/arcanas'
import { BEAST_GATES } from '@/data/beastGates.part1'
import { BEAST_GATES_LATE } from '@/data/beastGates.late'
import { HUMAN_GATES } from '@/data/humanGates.early'
import { HUMAN_GATES_LATE } from '@/data/humanGates.late'
import { SAGE_GATES } from '@/data/sageGates.early'
import { SAGE_GATES_LATE } from '@/data/sageGates.late'

export const ALL_GATES = [
  ...BEAST_GATES,
  ...BEAST_GATES_LATE,
  ...HUMAN_GATES,
  ...HUMAN_GATES_LATE,
  ...SAGE_GATES,
  ...SAGE_GATES_LATE,
]

const gateById = new Map(ALL_GATES.map((gate) => [gate.id, gate]))

export function listGates() {
  return ALL_GATES
}

export function getGateById(id) {
  return gateById.get(id) || null
}

export function getGateByPosition(arcana, gateNumber) {
  return ALL_GATES.find((gate) => gate.arcana === arcana && gate.gateNumber === gateNumber) || null
}

export function getArcana(id) {
  return ARCANAS.find((arcana) => arcana.id === id) || null
}

export function gatesForArcana(arcanaId) {
  return ALL_GATES.filter((gate) => gate.arcana === arcanaId)
}

export function getQuest(gateId, questId) {
  const gate = getGateById(gateId)
  if (!gate) return null
  if (gate.bossTrial?.id === questId) return { kind: 'boss', gate, quest: gate.bossTrial }
  const day = gate.days.find((item) => item.id === questId)
  if (!day) return null
  return { kind: 'day', gate, quest: day }
}
