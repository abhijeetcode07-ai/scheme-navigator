async function postGemini(payload, signal) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'Gemini is unavailable right now.')
    error.code = data.code || 'request_failed'
    throw error
  }
  return data
}

export function requestMatchExplanations({ language, answers, schemes, signal }) {
  return postGemini({ mode: 'matches', language, answers, schemes }, signal)
}

export function requestDetailExplanation({ language, answers, scheme, signal }) {
  return postGemini({ mode: 'detail', language, answers, scheme }, signal)
}
