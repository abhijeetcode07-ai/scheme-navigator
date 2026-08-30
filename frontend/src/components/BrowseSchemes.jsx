import { useEffect, useMemo, useState } from 'react'
import { fetchPublishedSchemes } from '../lib/catalog'
import { fullSchemes } from '../data/fullSchemes'
import './BrowseSchemes.css'

const sectors = ['All sectors', 'Education', 'Health & Wellness', 'Jobs & Skills', 'Housing & Utilities', 'Finance & Insurance', 'Agriculture & Livelihoods', 'Women & Child', 'Social Justice', 'Disability Support']
const PAGE_SIZE = 24

function toDetailRecord(item) {
  const sector = item.sector || item.category || item.sourceSection || 'Government support'
  return {
    ...item,
    id: item.id,
    serial: item.serial || 0,
    name: item.displayName || item.name || 'Untitled scheme record',
    sector,
    category: item.category || sector,
    ministry: item.displayMinistry || item.ministry_department || item.ministry || 'Government department not stated',
    categories: item.categories || [sector],
    categoryLabel: item.category_label || item.categoryLabel || 'Government support',
    educationLevel: item.education_level || item.educationLevel || 'All levels',
    incomeCeiling: item.income_ceiling || item.incomeCeiling || 'Not specified',
    incomeLimit: item.income_limit ?? item.incomeLimit ?? null,
    officialEligibility: item.eligibility_official || item.officialEligibility || '',
    plainEligibility: item.displayEligibility || item.eligibility_plain || item.plainEligibility || 'Open the record to review the current eligibility conditions.',
    benefits: item.displayBenefits || item.benefits || 'Benefit details are available in the official record.',
    documents: item.displayDocuments || item.documents_required || item.documents || [],
    applicationMode: item.application_mode || item.applicationMode || '',
    officialApplyLink: item.official_apply_link || item.officialApplyLink || item.verificationSourceLink || '',
    verificationSourceLink: item.verification_source_link || item.verificationSourceLink || '',
    applicationWindow: item.application_window || item.applicationWindow || '',
    lastVerifiedDate: item.last_verified_date || item.lastVerifiedDate || '',
    notesFlags: item.notes_flags || item.notesFlags || '',
  }
}

function recordKey(item) {
  return String(item.id || item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function mergePublishedOverlay(localRecords, publishedRecords) {
  const overlays = new Map(publishedRecords.map((item) => [recordKey(item), item]))
  return localRecords.map((record) => {
    const overlay = overlays.get(recordKey(record))
    return overlay ? toDetailRecord({ ...record, ...overlay, category: record.category, sector: record.sector }) : record
  })
}

export default function BrowseSchemes({ language = 'English', onBack, onSelect }) {
  const [items, setItems] = useState(() => fullSchemes.filter((item) => item.active !== false).map(toDetailRecord))
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('All sectors')
  const status = 'ready'

  useEffect(() => {
    let active = true
    const completeLocalCatalog = fullSchemes.filter((item) => item.active !== false).map(toDetailRecord)
    fetchPublishedSchemes({ languageCode: language, page: 0, pageSize: 100 })
      .then((result) => {
        if (!active || !Array.isArray(result?.data) || !result.data.length) return
        setItems(mergePublishedOverlay(completeLocalCatalog, result.data))
      })
      .catch(() => {})
    return () => { active = false }
  }, [language])

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.name} ${item.ministry} ${item.plainEligibility} ${item.benefits} ${item.verificationSourceLink}`.toLowerCase()
    const queryMatch = !query.trim() || haystack.includes(query.trim().toLowerCase())
    const sectorMatch = sector === 'All sectors' || item.sector === sector
    return queryMatch && sectorMatch
  }), [items, query, sector])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const currentItems = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  return <main className="browse-page">
    <header className="browse-header"><button type="button" className="back-link" onClick={onBack}><span aria-hidden="true">←</span> Back to SchemeSetu</button><p className="eyebrow">The national catalogue</p><h1>Find support by sector.</h1><p className="browse-lede">Search the complete local scheme catalogue across all nine support routes. Every record keeps its official source and verification trail visible.</p><p className="browse-catalogue-count"><strong>{filtered.length}</strong> records in {sector === 'All sectors' ? 'the full catalogue' : sector}</p></header>
    <section className="browse-toolbar" aria-label="Scheme catalogue filters"><label className="browse-search"><span className="sr-only">Search schemes</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="Search by scheme, ministry, or need" /></label><div className="sector-filter" role="list" aria-label="Filter by sector">{sectors.map((option) => <button type="button" key={option} className={sector === option ? 'is-active' : ''} aria-pressed={sector === option} onClick={() => { setSector(option); setPage(0) }}>{option}</button>)}</div></section>
    {status === 'loading' && <div className="browse-state">Loading verified scheme records…</div>}
    {status === 'error' && <div className="browse-state">The catalogue is temporarily unavailable. Please try again shortly.</div>}
    {status === 'ready' && <section className="browse-grid" aria-live="polite">{currentItems.map((item) => <button type="button" className="browse-card" key={item.id} onClick={() => onSelect?.(item)}><span className="browse-card-top"><span>{item.sector}</span><span>{item.lastVerifiedDate ? 'Verified record' : 'Official record'}</span></span><strong>{item.name}</strong><small>{item.ministry}</small><p>{item.plainEligibility}</p><span className="browse-open">Open record <span aria-hidden="true">↗</span></span></button>)}</section>}
    {status === 'ready' && !filtered.length && <div className="browse-state">No records match those filters yet.</div>}
    <nav className="browse-pagination" aria-label="Catalogue pages"><button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0}>← Previous</button><span>Page {currentPage + 1} of {pageCount}</span><button type="button" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage >= pageCount - 1}>Next →</button></nav>
  </main>
}
