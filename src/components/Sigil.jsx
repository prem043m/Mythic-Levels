import { ATTRIBUTES } from '@/config/constants'

// Radar of the nine attributes (0–100), drawn from the player's real attribute values.
export default function Sigil({ attributes }) {
  const n = ATTRIBUTES.length
  const R = 78
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [130 + Math.cos(a) * v, 130 + Math.sin(a) * v]
  }
  const poly = ATTRIBUTES.map((a, i) => pt(i, Math.max(4, (R * (attributes[a.id] || 0)) / 100)).join(',')).join(' ')
  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-xs mx-auto" role="img" aria-label={`Attributes: ${ATTRIBUTES.map((a) => `${a.label} ${attributes[a.id] || 0}`).join(', ')}`}>
      {[0.33, 0.66, 1].map((k) => <polygon key={k} points={ATTRIBUTES.map((_, i) => pt(i, R * k).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,0.12)" />)}
      {ATTRIBUTES.map((a, i) => { const [x, y] = pt(i, R + 16); return <text key={a.id} x={x} y={y} fontSize="8.5" textAnchor="middle" fill="#9a9488">{a.label}</text> })}
      <polygon points={poly} fill="color-mix(in srgb, var(--color-mystic) 35%, transparent)" stroke="var(--color-ancient)" strokeWidth="1.5" />
    </svg>
  )
}
