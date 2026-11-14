import { useMemo, useState } from 'react'
import { Btn, H, Panel } from '@/components/ui'
import { getGateById } from '@/data/catalog'
import { evaluateSubmission } from '@/services/evaluation/engine'
import { FIELD_DEFS, FIELD_ORDER } from '@/services/evaluation/protocol'
import fixture from '@/test/calibration/human-v1/human-evaluation-v1.json'

const DIMENSIONS = [
  ['actionSpecificity', 'Action'],
  ['taskRelevance', 'Relevance'],
  ['difficultyAwareness', 'Difficulty'],
  ['reflectionQuality', 'Reflection'],
]

const gate = getGateById(fixture.quest.gateId)
if (!gate) throw new Error(`Unknown evaluation fixture gate: ${fixture.quest.gateId}`)

const testStage = {
  id: 'human-evaluation-v1-challenge',
  day: 1,
  phase: fixture.quest.phase,
  objective: fixture.quest.objective,
  task: fixture.quest.objective,
  prompt: fixture.quest.prompt,
}

export default function EvaluationLab() {
  const [selectedId, setSelectedId] = useState(fixture.submissions[0].id)
  const selected = fixture.submissions.find((submission) => submission.id === selectedId)
  const [fields, setFields] = useState(selected.fields)
  const [result, setResult] = useState(null)

  const labels = useMemo(() => fixture.submissions.map(({ id, group }) => `${id} · ${group}`), [])

  const selectCase = (id) => {
    const submission = fixture.submissions.find((item) => item.id === id)
    if (!submission) return
    setSelectedId(id)
    setFields(submission.fields)
    setResult(null)
  }

  const evaluate = () => {
    setResult(evaluateSubmission({ gate, day: testStage, fields }))
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <Panel>
        <p className="engraved text-xs text-cosmic">Development-only · no player save</p>
        <h1 className="mt-2 font-display text-2xl text-ancient">Human Evaluation Lab</h1>
        <p className="mt-2 text-sm text-muted">
          Runs the V5 submission evaluator against an in-memory copy of the human-v1 cases.
          It does not load or update player progress, write to storage, or award rewards.
        </p>
        <p className="mt-3 text-sm">
          <strong>{fixture.quest.title}</strong> · {fixture.quest.gate} · {fixture.quest.stage}
        </p>
        <p className="text-sm text-muted">{fixture.quest.objective}</p>
      </Panel>

      <Panel>
        <H>Submission</H>
        <label className="block text-sm">
          Case
          <select
            aria-label="Submission case"
            className="mt-1 w-full rounded-lg border border-ancient-dim/40 bg-obsidian-2 p-2"
            value={selectedId}
            onChange={(event) => selectCase(event.target.value)}
          >
            {fixture.submissions.map((submission, index) => (
              <option key={submission.id} value={submission.id}>{labels[index]}</option>
            ))}
          </select>
        </label>

        <div className="mt-3 space-y-3">
          {FIELD_ORDER.map((id) => (
            <label key={id} className="block text-sm">
              {FIELD_DEFS[id].label}
              <textarea
                aria-label={FIELD_DEFS[id].label}
                className="mt-1 w-full rounded-lg border border-ancient-dim/40 bg-obsidian-2 p-2"
                rows={2}
                value={fields[id] || ''}
                onChange={(event) => {
                  setFields((current) => ({ ...current, [id]: event.target.value }))
                  setResult(null)
                }}
              />
            </label>
          ))}
        </div>
        <Btn className="mt-4" onClick={evaluate}>Evaluate {selectedId}</Btn>
      </Panel>

      {result && (
        <Panel aria-live="polite">
          <H>Evaluator result · {selectedId}</H>
          <p className="text-lg font-semibold">{result.decision}</p>
          <p className="text-sm text-muted">
            Quality {result.qualityScore}/100 · confidence {Math.round(result.confidence * 100)}%
          </p>
          <dl className="mt-3 space-y-1 text-sm">
            {DIMENSIONS.map(([id, label]) => (
              <div key={id} className="flex justify-between">
                <dt>{label}</dt>
                <dd>{result.dimensions[id]}/100</dd>
              </div>
            ))}
          </dl>
          {result.missingCriteria.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold">Missing criteria</h3>
              <ul className="list-disc pl-5 text-sm text-muted">
                {result.missingCriteria.map((item, index) => (
                  <li key={`${item.id}-${index}`}>{item.label || item.id}: {item.reason}</li>
                ))}
              </ul>
            </div>
          )}
          {result.feedback.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold">Feedback</h3>
              <ul className="list-disc pl-5 text-sm text-muted">
                {result.feedback.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            Evaluation only. No XP, attributes, mastery, or player data changed.
          </p>
        </Panel>
      )}

      <a className="inline-block text-sm text-cosmic underline" href="/#/">Return to the app</a>
    </main>
  )
}
