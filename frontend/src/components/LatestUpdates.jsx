import { useEffect, useMemo, useState } from 'react'
import { fetchLatestFeed, listPublishedFeed } from '../lib/catalog'
import './LatestUpdates.css'

const categories = [
  ['education', 'Education'],
  ['health', 'Health & wellness'],
  ['jobs', 'Jobs & skills'],
  ['housing', 'Housing & utilities'],
  ['finance', 'Finance & insurance'],
  ['agriculture', 'Agriculture & livelihoods'],
  ['women-child', 'Women & child'],
  ['social-justice', 'Social justice'],
  ['disability', 'Disability support'],
]

const categoryRules = [
  ['education', /education|school|college|university|scholarship|fellowship|student|exam|literacy|learning/i],
  ['health', /health|hospital|medical|medicine|ayush|insurance|vaccin|disease|maternal|nutrition|wellness|treatment/i],
  ['jobs', /job|employment|career|apprentice|skill|training|placement|labour|labor|workforce|livelihood|startup|entrepreneur/i],
  ['housing', /housing|home|urban|rural development|water|sanitation|electricity|power|energy|gas|fuel|smart city|infrastructure|mobility/i],
  ['finance', /finance|bank|credit|pension|insurance|tax|income|payment|financial inclusion|economy|investment|loan|dbt/i],
  ['agriculture', /agri|farmer|farming|crop|kisan|livestock|fisher|irrigation|fertilizer|rural|horticulture|animal husbandry/i],
  ['women-child', /women|woman|girl|child|children|maternal|anganwadi|wcd|nutrition|pregnan|lactating|family welfare|gender/i],
  ['social-justice', /social justice|sc|st|obc|minority|tribal|welfare|inclusion|dignity|backward class|senior citizen|manual scavenger/i],
  ['disability', /disab|divyang|accessib|rehabilitation|assistive|pwd|special needs|barrier-free/i],
]

function inferCategories(item) {
  const tagged = (item.tags || []).filter((tag) => tag.startsWith('category:')).map((tag) => tag.slice(9))
  if (tagged.length) return [...new Set(tagged)]
  const text = `${item.title || ''} ${item.summary || ''} ${item.source_name || ''}`
  return categoryRules.filter(([, pattern]) => pattern.test(text)).map(([id]) => id)
}

function enrichItem(item) {
  return { ...item, inferredCategories: inferCategories(item) }
}

const isMinistrySignal = (item) => item.source_type === 'ministry' || (item.tags || []).some((tag) => tag.startsWith('ministry:')) || /ministry|department|directorate|government of india|secretary|minister/i.test(`${item.title || ''} ${item.summary || ''}`)

export default function LatestUpdates({ language = 'English', onBack }) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let active = true
    fetchLatestFeed({ limit: 100 })
      .then((result) => {
        if (active) {
          const rawItems = Array.isArray(result?.data) ? result.data : []
          setItems(rawItems.map(enrichItem))
          setMeta(result?.meta || null)
          setStatus('ready')
        }
      })
      .catch(async () => {
        try {
          const fallback = await listPublishedFeed({ languageCode: language, limit: 100 })
          if (active) {
            setItems((Array.isArray(fallback) ? fallback : []).map(enrichItem))
            setMeta(null)
            setStatus('ready')
          }
        } catch {
          if (active) setStatus('error')
        }
      })
    return () => { active = false }
  }, [language, refreshTick])

  const handleRetry = () => {
    setStatus('loading')
    setRefreshTick((previous) => previous + 1)
  }

  const counts = useMemo(() => ({
    total: items.length,
    official: items.filter((item) => item.source_type === 'official').length,
    ministry: items.filter(isMinistrySignal).length,
    reputable: items.filter((item) => item.source_type === 'reputable_news').length,
    categories: Object.fromEntries(categories.map(([id]) => [id, items.filter((item) => item.inferredCategories.includes(id)).length])),
  }), [items])

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesFilter = filter === 'all' || (filter === 'official' && item.source_type === 'official') || (filter === 'ministry' && isMinistrySignal(item)) || (filter === 'reputable' && item.source_type === 'reputable_news') || categories.some(([id]) => filter === id && item.inferredCategories.includes(id))
    if (!matchesFilter) return false
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase().trim()
    return `${item.displayTitle || item.title || ''} ${item.displaySummary || item.summary || ''} ${item.source_name || ''} ${(item.tags || []).join(' ')}`.toLowerCase().includes(query)
  }), [items, filter, searchQuery])

  const refreshedAtDisplay = useMemo(() => {
    const rawDate = meta?.refreshedAt || items[0]?.fetched_at || items[0]?.published_at
    if (!rawDate) return 'Refreshing verified sources'
    const parsed = new Date(rawDate)
    return Number.isNaN(parsed.getTime()) ? 'Recently refreshed' : `Last refreshed: ${parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} at ${parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
  }, [meta, items])

  return (
    <main className="updates-page" id="live-feed-main">
      <header className="updates-header">
        <button type="button" className="back-link" onClick={onBack} aria-label="Back to SchemeSetu homepage"><span aria-hidden="true">←</span> Back to SchemeSetu</button>
        <p className="eyebrow" id="live-feed-eyebrow"><span className="live-dot" aria-hidden="true" /> Live public system</p>
        <h1 id="live-feed-heading">Live feed from the public system.</h1>
        <p>Trustworthy, continuously refreshed announcements, ministry notifications, and clearly labelled reputable reporting across every SchemeSetu support route.</p>
      </header>

      <div className="updates-toolbar" aria-label="Feed controls">
        <div className="toolbar-top">
          <div className="status-indicator"><span className="pulse-indicator" aria-hidden="true" /><span className="refreshed-text">{refreshedAtDisplay}</span></div>
          <div className="feed-search-wrap"><input type="search" className="feed-search-input" placeholder="Filter by keyword, scheme, or ministry…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search within live announcements" />{searchQuery && <button type="button" className="search-clear-button" onClick={() => setSearchQuery('')} aria-label="Clear search">✕</button>}</div>
        </div>
        <nav className="filter-tabs" aria-label="Filter by source type">
          {[['all', 'All', counts.total], ['official', 'Official Government', counts.official], ['ministry', 'Ministry signals', counts.ministry], ['reputable', 'Reputable News', counts.reputable]].map(([id, label, count]) => <button type="button" key={id} className={`filter-tab ${filter === id ? 'is-active' : ''}`} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label} <span className="tab-count">{count}</span></button>)}
        </nav>
        <nav className="filter-tabs category-filter-tabs" aria-label="Filter by SchemeSetu support route">
          {categories.map(([id, label]) => <button type="button" key={id} className={`filter-tab ${filter === id ? 'is-active' : ''}`} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label} <span className="tab-count">{counts.categories[id]}</span></button>)}
        </nav>
      </div>

      {status === 'loading' && <section className="updates-grid updates-skeletons" aria-label="Loading announcements">{[1, 2, 3, 4, 5, 6].map((key) => <div className="update-skeleton-card" key={key} aria-hidden="true" />)}</section>}
      {status === 'error' && <div className="updates-state updates-state-error" role="alert"><p className="state-heading">Feed temporarily unavailable</p><p className="state-description">We were unable to load live feed announcements from the public system. Please check your connection or try again.</p><button type="button" className="retry-button" onClick={handleRetry}>Try again ↺</button></div>}
      {status === 'ready' && !filteredItems.length && <div className="updates-state" role="status"><p className="state-heading">No announcements found</p><p className="state-description">{searchQuery ? `No announcements match “${searchQuery}”. Try a broader keyword.` : 'This support route is connected and will populate as its official or reputable sources publish relevant updates.'}</p>{(searchQuery || filter !== 'all') && <button type="button" className="retry-button" onClick={() => { setFilter('all'); setSearchQuery('') }}>Reset filters</button>}</div>}
      {status === 'ready' && filteredItems.length > 0 && <section className="updates-grid" aria-live="polite" aria-labelledby="live-feed-heading">{filteredItems.map((item) => { const badgeLabel = item.source_type === 'official' ? 'Official' : item.source_type === 'ministry' ? 'Ministry' : 'Reputable news'; const badgeClass = item.source_type === 'official' ? 'badge-official' : item.source_type === 'ministry' ? 'badge-ministry' : 'badge-news'; const formattedDate = item.published_at ? new Date(item.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'; return <article className="update-card" key={item.id || item.source_url} tabIndex={0}><div className="update-meta"><span className={`source-badge ${badgeClass}`}>{badgeLabel}</span><time dateTime={item.published_at || undefined}>{formattedDate}</time></div><div className="update-card-route">{item.inferredCategories.slice(0, 2).map((id) => categories.find(([categoryId]) => categoryId === id)?.[1]).filter(Boolean).join(' · ') || 'Public system'}</div><h2>{item.displayTitle || item.title}</h2>{(item.displaySummary || item.summary) && <p>{item.displaySummary || item.summary}</p>}<a href={item.source_url} target="_blank" rel="noopener noreferrer" className="source-link" aria-label={`Read full source notice from ${item.source_name} (opens in new tab)`}>Read source: {item.source_name} <span aria-hidden="true">↗</span></a></article> })}</section>}
    </main>
  )
}
