import { supabase } from './supabase'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function listPublishedSchemes({ languageCode = 'English', page = 0, pageSize = 24 } = {}) {
  const client = requireSupabase()
  const from = page * pageSize
  const to = from + pageSize - 1
  const { data, error } = await client
    .from('schemes')
    .select('*, scheme_translations(language_code, name, ministry_department, eligibility_plain, benefits, documents_required, source)')
    .eq('status', 'published')
    .order('name')
    .range(from, to)

  if (error) throw error
  return (data || []).map((scheme) => {
    const translation = scheme.scheme_translations?.find((item) => item.language_code === languageCode)
    const { scheme_translations: _translations, ...canonical } = scheme
    return {
      ...canonical,
      displayName: translation?.name || canonical.name,
      displayMinistry: translation?.ministry_department || canonical.ministry_department,
      displayEligibility: translation?.eligibility_plain || canonical.eligibility_plain,
      displayBenefits: translation?.benefits || canonical.benefits,
      displayDocuments: translation?.documents_required?.length ? translation.documents_required : canonical.documents_required,
    }
  })
}

export async function listPublishedFeed({ languageCode = 'English', limit = 24 } = {}) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('feed_items')
    .select('*, feed_item_translations(language_code, title, summary, source)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).map((item) => {
    const translation = item.feed_item_translations?.find((entry) => entry.language_code === languageCode)
    const { feed_item_translations: _translations, ...canonical } = item
    return {
      ...canonical,
      displayTitle: translation?.title || canonical.title,
      displaySummary: translation?.summary || canonical.summary,
    }
  })
}

export async function getProfile(userId) {
  const client = requireSupabase()
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(userId, values) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listChatThreads(userId) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('chat_threads')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listChatMessages(userId, threadId) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createChatThread(userId, languageCode = 'English') {
  const client = requireSupabase()
  const { data, error } = await client
    .from('chat_threads')
    .insert({ user_id: userId, language_code: languageCode })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveChatMessage({ userId, threadId, role, content }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('chat_messages')
    .insert({ user_id: userId, thread_id: threadId, role, content })
    .select()
    .single()
  if (error) throw error
  return data
}
