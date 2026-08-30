function getConfig() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server environment is not configured')
  return { url: url.replace(/\/$/, ''), key }
}

export async function supabaseRest(path, options = {}) {
  const { url, key } = getConfig()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const body = await response.text()
  let data = null
  try { data = body ? JSON.parse(body) : null } catch { data = body }
  if (!response.ok) {
    const error = new Error(data?.message || `Supabase request failed with ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

export function jsonResponse(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  }
}
