import { supabaseRest } from './_lib/supabase-admin.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).setHeader('Content-Type', 'application/json').json({ code: 'method_not_allowed', message: 'Only GET is supported.' })
    return
  }

  const page = Math.max(0, Number.parseInt(request.query.page || '0', 10) || 0)
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(request.query.pageSize || '24', 10) || 24))
  const languageCode = String(request.query.language || 'English').replace(/[^\w-]/g, '').slice(0, 32)
  const from = page * pageSize
  const to = from + pageSize - 1
  const query = new URLSearchParams({
    select: '*,scheme_translations(language_code,name,ministry_department,eligibility_plain,benefits,documents_required,source)',
    status: 'eq.published',
    order: 'name.asc',
    offset: String(from),
    limit: String(pageSize),
  })

  try {
    const rows = await supabaseRest(`schemes?${query.toString()}`)
    const data = (rows || []).map((scheme) => {
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
    response.status(200).setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600').json({ data, page, pageSize, from, to })
  } catch (error) {
    response.status(error.status || 500).json({ code: 'scheme_catalog_unavailable', message: error.message })
  }
}
