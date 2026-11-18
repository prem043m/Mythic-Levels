import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getGateById } from '@/data/catalog'
import { evaluateSubmission } from '@/services/evaluation/engine'
import fixture from '@/test/calibration/human-v1/human-evaluation-v1.json'
import EvaluationLab from '@/pages/EvaluationLab'

describe('human evaluation lab', () => {
  it('loads twenty uniquely identified cases with the five submission fields', () => {
    expect(fixture.submissions).toHaveLength(20)
    expect(new Set(fixture.submissions.map(({ id }) => id)).size).toBe(20)
    for (const { fields } of fixture.submissions) {
      expect(Object.keys(fields).sort()).toEqual(['action', 'difficulty', 'outcome', 'reflection', 'situation'])
    }
  })

  it('evaluates a fixture case with the V5 engine without progression effects', async () => {
    const user = userEvent.setup()
    render(<EvaluationLab />)
    const testCase = fixture.submissions[0]
    const gate = getGateById(fixture.quest.gateId)
    const expected = evaluateSubmission({
      gate,
      day: { phase: fixture.quest.phase },
      fields: testCase.fields,
    })

    await user.click(screen.getByRole('button', { name: `Evaluate ${testCase.id}` }))

    expect(screen.getByText(expected.decision)).toBeInTheDocument()
    expect(screen.getByText(/No XP, attributes, mastery, or player data changed\./)).toBeInTheDocument()
  })

  it('allows selecting and evaluating the missing-field case', async () => {
    const user = userEvent.setup()
    render(<EvaluationLab />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Submission case' }), 'H08')
    await user.click(screen.getByRole('button', { name: 'Evaluate H08' }))

    expect(screen.getByText('INSUFFICIENT_INFORMATION')).toBeInTheDocument()
    expect(screen.getAllByText(/Please answer:/).length).toBeGreaterThan(0)
  })
})
