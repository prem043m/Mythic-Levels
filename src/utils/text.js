const STOP = new Set('the a an and or of to in is it on for with that this as are be you your my me how what why do does can when so at by was were am but not have has had if then from up out just very really'.split(' '))
export const stem = (w) => w.replace(/(ing|ed|es|s)$/, '')
export const tokenize = (t) => (String(t).toLowerCase().match(/[a-z]{2,}/g) || []).filter((w) => !STOP.has(w)).map(stem)
export function jaccard(a, b) {
  const A = new Set(a)
  const B = new Set(b)
  if (!A.size || !B.size) return 0
  let n = 0
  for (const x of A) if (B.has(x)) n += 1
  return n / (A.size + B.size - n)
}
