import { useState } from 'react'
import { getArcana, getGateById } from '@/data/catalog'
import { ARCANA_ASSETS, GATE_ASSETS } from '@/data/identityAssets'

function IdentityImage({ src, fallback, alt, className }) {
  const [failed, setFailed] = useState(false)
  return failed || !src
    ? <span className={`${className} progression-identity-fallback`} aria-hidden="true">{fallback}</span>
    : <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
}

export function ArcanaEmblem({ arcanaId, arcana, size = 'regular', state = 'available' }) {
  const resolved = arcana || getArcana(arcanaId)
  if (!resolved) return null
  return (
    <span className={`progression-identity progression-arcana-emblem progression-arcana-${resolved.id} progression-identity-${size} progression-state-${state}`} role="img" aria-label={`${resolved.name} emblem`}>
      <IdentityImage src={ARCANA_ASSETS[resolved.id]} fallback={resolved.glyph} alt="" className="progression-identity-image" />
    </span>
  )
}

export function GateEmblem({ gateId, gate, size = 'regular', state = 'available' }) {
  const resolved = gate || getGateById(gateId)
  if (!resolved) return null
  return (
    <span className={`progression-identity progression-gate-emblem progression-gate-${resolved.arcana} progression-identity-${size} progression-state-${state}`} role="img" aria-label={`${resolved.name} emblem`}>
      <IdentityImage src={GATE_ASSETS[resolved.id]} fallback={resolved.symbol} alt="" className="progression-identity-image" />
    </span>
  )
}

export function ProgressionIdentity({ gateId, arcanaId, size = 'regular', state = 'available' }) {
  return gateId
    ? <GateEmblem gateId={gateId} size={size} state={state} />
    : <ArcanaEmblem arcanaId={arcanaId} size={size} state={state} />
}
