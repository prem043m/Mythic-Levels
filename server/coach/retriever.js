import { listGates } from '@/data/catalog'
import { tokenize } from '@/utils/text'

// Small BM25-style keyword retriever over the Gate content. This is the seam where
// a vector store / embeddings can replace it later without touching the API or UI.
export { tokenize }

let corpus
export function buildCorpus() {
  if (corpus) return corpus
  const out = []
  for (const g of listGates()) {
    const base = { gateId: g.id }
    out.push({ ...base, id: `${g.id}:overview`, label: `${g.name} — overview`, text: [g.principle, g.lore, g.philosophy, g.outcome].filter(Boolean).join(' ') })
    for (const d of g.days) {
      out.push({ ...base, id: d.id, label: `${g.name} — Day ${d.day}: ${d.title}`, task: d.task, text: [d.title, d.objective, d.explanation, d.task].filter(Boolean).join(' ') })
    }
    out.push({ ...base, id: g.bossTrial.id, label: `${g.name} — Boss Trial`, task: g.bossTrial.description, text: [g.bossTrial.title, g.bossTrial.description].join(' ') })
  }
  corpus = out.map((p) => ({ ...p, tokens: tokenize(`${p.label} ${p.text}`) }))
  return corpus
}

export function search(query, { gateId, k = 3 } = {}) {
  const docs = buildCorpus()
  const q = [...new Set(tokenize(query))]
  if (!q.length) return []
  const avg = docs.reduce((n, d) => n + d.tokens.length, 0) / docs.length
  const df = Object.fromEntries(q.map((t) => [t, docs.filter((d) => d.tokens.includes(t)).length]))
  return docs
    .map((d) => {
      let score = 0
      for (const t of q) {
        const f = d.tokens.filter((x) => x === t).length
        if (!f) continue
        const idf = Math.log(1 + (docs.length - df[t] + 0.5) / (df[t] + 0.5))
        score += (idf * f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.tokens.length / avg)))
      }
      if (gateId && d.gateId === gateId) score *= 1.4
      return { ...d, score }
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
