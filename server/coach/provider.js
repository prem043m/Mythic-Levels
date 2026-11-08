// A provider turns {question, passages, context} into an answer. Today: rule-based.
// FUTURE: return an LLM-backed provider here (same input/output) to get a RAG coach.
export const ruleBasedProvider = {
  name: 'rule-based',
  async answer({ question, passages }) {
    if (!passages.length) {
      return {
        answer: 'I could not find that in the Gates. Try asking about a practice you are doing — attention, discipline, listening, impulses, reflection.',
        sources: [],
      }
    }
    const [best] = passages
    const excerpt = best.text.length > 420 ? best.text.slice(0, 420).replace(/\s+\S*$/, '') + '…' : best.text
    const practice = passages.find((p) => p.task)?.task
    return {
      answer: `${excerpt}${practice ? `\n\nTry this now: ${practice}` : ''}`,
      sources: passages.map((p) => ({ id: p.id, gateId: p.gateId, label: p.label })),
    }
  },
}

export const getProvider = () => ruleBasedProvider
