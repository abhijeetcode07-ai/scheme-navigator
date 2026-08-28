import { useEffect, useMemo, useState } from 'react'
import { fetchPublishedSchemes, listPublishedSchemes } from '../lib/catalog'
import { schemes as localSchemes } from '../data/schemes'
import './BrowseSchemes.css'

const sectors = ['All sectors', 'Education', 'Health & Wellness', 'Jobs & Skills', 'Housing & Utilities', 'Finance & Insurance', 'Agriculture & Livelihoods', 'Women & Child', 'Social Justice', 'Disability Support']

function toDetailRecord(item) {
  return {
    ...item,
    id: item.id,
    serial: item.serial || 0,
    name: item.displayName || item.name,
    ministry: item.displayMinistry || item.ministry_department || item.ministry,
    categories: item.categories || [],
    categoryLabel: item.category_label || item.categoryLabel || 'General',
    educationLevel: item.education_level || item.educationLevel || 'All levels',
    incomeCeiling: item.income_ceiling || item.incomeCeiling || 'Not specified',
    incomeLimit: item.income_limit ?? item.incomeLimit ?? null,
    officialEligibility: item.eligibility_official || item.officialEligibility || '',
    plainEligibility: item.displayEligibility || item.eligibility_plain || item.plainEligibility || '',
    benefits: item.displayBenefits || item.benefits || '',
    documents: item.displayDocuments || item.documents_required || item.documents || [],
    applicationMode: item.application_mode || item.applicationMode || '',
    officialApplyLink: item.official_apply_link || item.officialApplyLink || '',
    verificationSourceLink: item.verification_source_link || item.verificationSourceLink || '',
    applicationWindow: item.application_window || item.applicationWindow || '',
    lastVerifiedDate: item.last_verified_date || item.lastVerifiedDate || '',
    notesFlags: item.notes_flags || item.notesFlags || '',
  }
}

export default function BrowseSchemes({ language = 'English', onBack, onSelect }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('All sectors')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    fetchPublishedSchemes({ languageCode: language, page, pageSize: 24 })
      .then((result) => { if (active) { setItems((result.data || []).map(toDetailRecord)); setStatus('ready') } })
      .catch(async () => {
        try {
          const fallback = await listPublishedSchemes({ languageCode: language, page, pageSize: 24 })
          if (active) { setItems(fallback.map(toDetailRecord)); setStatus('ready') }
        } catch { if (active) { setItems(localSchemes.map(toDetailRecord)); setStatus('ready') } }
      })
    return () => { active = false }
  }, [language, page])

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.name} ${item.ministry} ${item.plainEligibility}`.toLowerCase()
    const queryMatch = !query.trim() || haystack.includes(query.trim().toLowerCase())
    const sectorMatch = sector === 'All sectors' || item.sector === sector || (sector === 'Education' && !item.sector)
    return queryMatch && sectorMatch
  }), [items, query, sector])

  return <main className="browse-page">
    <header className="browse-header"><button type="button" className="back-link" onClick={onBack}><span aria-hidden="true">←</span> Back to SchemeSetu</button><p className="eyebrow">The national catalogue</p><h1>Find support by sector.</h1><p className="browse-lede">Search published scheme records by the kind of support you need. Every record keeps its official source and verification trail visible.</p></header>
    <section className="browse-toolbar" aria-label="Scheme catalogue filters"><label className="browse-search"><span className="sr-only">Search schemes</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by scheme, ministry, or need" /></label><div className="sector-filter" role="list" aria-label="Filter by sector">{sectors.map((option) => <button type="button" key={option} className={sector === option ? 'is-active' : ''} aria-pressed={sector === option} onClick={() => { setSector(option); setPage(0) }}>{option}</button>)}</div></section>
    {status === 'loading' && <div className="browse-state">Loading verified scheme records…</div>}
    {status === 'error' && <div className="browse-state">The catalogue is temporarily unavailable. Please try again shortly.</div>}
    {status === 'ready' && <section className="browse-grid" aria-live="polite">{filtered.map((item) => <button type="button" className="browse-card" key={item.id} onClick={() => onSelect?.(item)}><span className="browse-card-top"><span>{item.sector || 'Government support'}</span><span>Official record</span></span><strong>{item.name}</strong><small>{item.ministry}</small><p>{item.plainEligibility || 'Open the record to review eligibility, benefits, documents, and the official application route.'}</p><span className="browse-open">Open record <span aria-hidden="true">↗</span></span></button>)}</section>}
    {status === 'ready' && !filtered.length && <div className="browse-state">No published records match those filters yet.</div>}
    <nav className="browse-pagination" aria-label="Catalogue pages"><button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0}>← Previous</button><span>Page {page + 1}</span><button type="button" onClick={() => setPage((value) => value + 1)} disabled={items.length < 24}>Next →</button></nav>
  </main>
}
