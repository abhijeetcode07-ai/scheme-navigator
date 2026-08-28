const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const MAX_SCHEMES = 24
const MAX_TEXT = 12000

function jsonResponse(status, body) {
  return { status, body }
}

function cleanText(value, max = MAX_TEXT) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalizeScheme(scheme, compact = false) {
  return {
    id: cleanText(scheme?.id, 80),
    name: cleanText(scheme?.name, 260),
    plainEligibility: cleanText(scheme?.plainEligibility, compact ? 700 : 1800),
    benefits: cleanText(scheme?.benefits, compact ? 700 : 1800),
    documents: Array.isArray(scheme?.documents) ? scheme.documents.slice(0, compact ? 6 : 10).map((item) => cleanText(item, compact ? 220 : 400)).filter(Boolean) : [],
    notesFlags: cleanText(scheme?.notesFlags, compact ? 500 : 1000),
  }
}

function buildPrompt(mode, language, answers, schemes, scheme, messages = []) {
  const selectedLanguage = cleanText(language, 80) || 'English'
  const answerContext = {
    education: cleanText(answers?.education, 80),
    category: cleanText(answers?.category, 80),
    income: cleanText(answers?.income, 80),
    situation: cleanText(answers?.notes, 1200),
  }

  if (mode === 'detail') {
    return `You are SchemeSetu, a careful plain-language guide to Indian government education and scholarship schemes. Write entirely in ${selectedLanguage}. The deterministic eligibility match has already been made by the app; do not invent new eligibility, benefits, deadlines, documents, or amounts. Use only the supplied record. If the record contains an uncertainty or verification flag, preserve that caution. Translate the scheme name and ministry too. Return JSON only with exactly these fields: name, ministry, why, support, beforeApply, documents. The first five fields must be strings and documents must be an array of short document strings using only the supplied record. Keep each text field to 1-3 short sentences. Do not translate URLs, official abbreviations, currency values, or dates.\n\nUser context:\n${JSON.stringify(answerContext)}\n\nScheme record:\n${JSON.stringify(normalizeScheme(scheme))}`
  }

  if (mode === 'chat') {
    const history = messages.slice(-10).map((m) => `${m.role === 'user' ? 'User' : 'SetuSathi'}: ${m.content}`).join('\n')
    return `You are SetuSathi, the conversational AI assistant for SchemeSetu, a generalized Indian government-scheme and citizen-aid finder. You help people understand education, livelihoods, health, housing, finance, insurance, social protection, disability, women-and-child support, agriculture, skills, and other public schemes. Write entirely in ${selectedLanguage}. Be helpful, empathetic, concise, and professional. Use the supplied published records as the only factual scheme source. Never invent eligibility, amounts, deadlines, documents, or application routes. If the requested scheme or fact is not in the supplied records, say that you do not have a verified answer and direct the user to the linked official portal or to Browse Schemes. For eligibility questions, explain that matching is indicative and the official authority makes the final decision. Preserve uncertainty and current-cycle caveats. Return JSON only with exactly one field: content.\n\nUser context:\n${JSON.stringify(answerContext)}\n\nPublished scheme records for reference:\n${JSON.stringify(schemes.map((item) => normalizeScheme(item, true)))}\n\nConversation history:\n${history}`
  }

  return `You are SchemeSetu, a careful plain-language guide to Indian government education and scholarship schemes. Write entirely in ${selectedLanguage}. The app's deterministic matcher is authoritative: do not change the list, add eligibility requirements, or claim that a user is definitely approved. For each supplied scheme, translate the scheme name and write one short, natural sentence explaining why it may be relevant based only on the supplied eligibility and the user's selected answers. Preserve official abbreviations in parentheses and uncertainty flags when relevant. Return JSON only as an array of objects with exactly these fields: id, name, reason. Keep each reason under 180 characters.\n\nUser context:\n${JSON.stringify(answerContext)}\n\nMatched scheme records:\n${JSON.stringify(schemes.map(normalizeScheme))}`
}

function parseJsonText(text) {
  const raw = cleanText(text, 24000)
  try {
    return JSON.parse(raw)
  } catch {
    const start = Math.min(...[raw.indexOf('['), raw.indexOf('{')].filter((index) => index >= 0))
    const end = Math.max(raw.lastIndexOf(']'), raw.lastIndexOf('}'))
    if (Number.isFinite(start) && start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function extractText(payload) {
  return payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || ''
}

function validateOutput(mode, data, sourceSchemes) {
  if (mode === 'chat') {
    return { content: cleanText(data?.content, 4000) }
  }
  if (mode === 'detail') {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null
    return {
      name: cleanText(data.name, 260),
      ministry: cleanText(data.ministry, 500),
      why: cleanText(data.why, 1400),
      support: cleanText(data.support, 1800),
      beforeApply: cleanText(data.beforeApply, 1400),
      documents: Array.isArray(data.documents) ? data.documents.slice(0, 10).map((item) => cleanText(item, 400)).filter(Boolean) : [],
    }
  }
  if (!Array.isArray(data)) return null
  const validIds = new Set(sourceSchemes.map((scheme) => scheme.id))
  return data
    .filter((item) => item && validIds.has(item.id))
    .map((item) => ({ id: item.id, name: cleanText(item.name, 260), reason: cleanText(item.reason, 240) }))
    .filter((item) => item.reason && item.name)
}

async function callGemini(mode, language, answers, schemes, scheme, messages = []) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return jsonResponse(503, { code: 'missing_key', message: 'Gemini is not configured yet, so the verified scheme text is being shown.' })

  const prompt = buildPrompt(mode, language, answers, schemes, scheme, messages)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) return jsonResponse(502, { code: 'gemini_error', message: 'Gemini could not prepare the language-aware explanation. The verified scheme text is still available.' })

  const parsed = parseJsonText(extractText(payload))
  const sourceSchemes = mode === 'detail' ? [scheme] : schemes
  const validated = validateOutput(mode, parsed, sourceSchemes)
  if (!validated || (mode === 'matches' && validated.length === 0)) return jsonResponse(502, { code: 'invalid_output', message: 'Gemini returned an unusable explanation. The verified scheme text is still available.' })
  if (mode === 'chat') return jsonResponse(200, { message: validated })
  return jsonResponse(200, mode === 'detail' ? { detail: validated } : { explanations: validated })
}

export async function handleGeminiRequest({ method, body }) {
  if (method !== 'POST') return jsonResponse(405, { code: 'method_not_allowed', message: 'Only POST is supported.' })
  if (!body || typeof body !== 'object') return jsonResponse(400, { code: 'invalid_request', message: 'The request body must be JSON.' })

  const mode = body.mode === 'chat' ? 'chat' : (body.mode === 'detail' ? 'detail' : 'matches')
  const language = cleanText(body.language, 80)
  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {}
  const schemes = Array.isArray(body.schemes) ? body.schemes.slice(0, MAX_SCHEMES).map(normalizeScheme).filter((scheme) => scheme.id && scheme.name) : []
  const scheme = normalizeScheme(body.scheme)
  const messages = Array.isArray(body.messages) ? body.messages.slice(-10).map((m) => ({ role: String(m.role), content: cleanText(m.content, 2000) })) : []

  if (mode === 'matches' && schemes.length === 0) return jsonResponse(400, { code: 'no_schemes', message: 'No matched schemes were provided.' })
  if (mode === 'detail' && (!scheme.id || !scheme.name)) return jsonResponse(400, { code: 'no_scheme', message: 'No scheme was provided.' })
  if (mode === 'chat' && messages.length === 0) return jsonResponse(400, { code: 'no_messages', message: 'No messages were provided.' })

  try {
    return await callGemini(mode, language, answers, schemes, scheme, messages)
  } catch {
    return jsonResponse(502, { code: 'network_error', message: 'Gemini is temporarily unavailable. The verified scheme text is still available.' })
  }
}

async function readRequestBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  let raw = ''
  for await (const chunk of request) raw += chunk
  try { return JSON.parse(raw || '{}') } catch { return null }
}

export default async function handler(request, response) {
  const result = await handleGeminiRequest({ method: request.method, body: await readRequestBody(request) })
  response.setHeader('Cache-Control', 'no-store')
  response.status(result.status).json(result.body)
}
