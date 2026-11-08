import { useMemo } from 'react'
import { evaluateReflection, CRITERIA } from '@/services/progression/reflection'

const LABEL = { specificity: 'Specific moment', relevance: 'On theme', awareness: 'Trigger / pattern', application: 'Action taken', learning: 'Lesson' }

// Live, plain-language view of the same deterministic rubric the engine uses. Structure, not truth.
export default function RubricLive({ text, gate, phase, others = [] }) {
  const key = others.join('|')
  const ev = useMemo(() => evaluateReflection(text, { gate, phase, others }), [text, gate, phase, key]) // eslint-disable-line react-hooks/exhaustive-deps
  if (ev.status === 'none') return <p className="text-xs text-muted">Write about one real moment. This check looks at structure, not at whether it is true.</p>
  return (
    <div>
      <ul className="flex flex-wrap gap-2 text-xs" aria-label="Reflection checklist">
        {CRITERIA.map((c) => (
          <li key={c} className={`rounded-full border px-2 py-0.5 ${ev.criteria[c] ? 'border-cosmic text-cosmic' : 'border-white/15 text-muted'} ${ev.keys.includes(c) ? 'font-semibold' : ''}`}>
            {ev.criteria[c] ? '✓' : '○'} {LABEL[c]}
          </li>
        ))}
      </ul>
      <p className={`text-xs mt-1 ${ev.status === 'accepted' ? 'text-cosmic' : 'text-ember'}`} role="status">
        {ev.status === 'accepted' ? 'This counts as evidence.' : ev.feedback[0]}
      </p>
    </div>
  )
}
