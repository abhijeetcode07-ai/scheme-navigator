import { useEffect, useMemo, useState } from 'react'
import { fetchLatestFeed, listPublishedFeed } from '../lib/catalog'
import './LatestUpdates.css'

export default function LatestUpdates({ language = 'English', onBack }) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    let active = true

    fetchLatestFeed({ limit: 50 })
      .then((result) => {
        if (active) {
          const rawItems = Array.isArray(result?.data) ? result.data : []
          setItems(rawItems)
          setMeta(result?.meta || null)
          setStatus('ready')
        }
      })
      .catch(async () => {
        try {
          const fallback = await listPublishedFeed({ languageCode: language, limit: 50 })
          if (active) {
            setItems(Array.isArray(fallback) ? fallback : [])
            setMeta(null)
            setStatus('ready')
          }
        } catch {
          if (active) setStatus('error')
        }
      })

    return () => {
      active = false
    }
  }, [language, refreshTick])

  const handleRetry = () => {
    setStatus('loading')
    setRefreshTick((prev) => prev + 1)
  }

  const counts = useMemo(() => {
    const total = items.length
    const official = items.filter((item) => item.source_type === 'official').length
    const ministry = items.filter((item) => item.source_type === 'ministry').length
    const reputable = items.filter((item) => item.source_type === 'reputable_news').length
    return { total, official, ministry, reputable }
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'official' && item.source_type === 'official') ||
        (filter === 'ministry' && item.source_type === 'ministry') ||
        (filter === 'reputable' && item.source_type === 'reputable_news')

      if (!matchesFilter) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const title = (item.displayTitle || item.title || '').toLowerCase()
      const summary = (item.displaySummary || item.summary || '').toLowerCase()
      const source = (item.source_name || '').toLowerCase()
      return title.includes(q) || summary.includes(q) || source.includes(q)
    })
  }, [items, filter, searchQuery])

  const refreshedAtDisplay = useMemo(() => {
    const rawDate = meta?.refreshedAt || items[0]?.published_at || items[0]?.fetched_at
    if (!rawDate) return 'Recently refreshed'
    try {
      const parsed = new Date(rawDate)
      return `Last refreshed: ${parsed.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} at ${parsed.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    } catch {
      return 'Recently refreshed'
    }
  }, [meta, items])

  return (
    <main className="updates-page" id="live-feed-main">
      <header className="updates-header">
        <button
          type="button"
          className="back-link"
          onClick={onBack}
          aria-label="Back to SchemeSetu homepage"
        >
          <span aria-hidden="true">←</span> Back to SchemeSetu
        </button>
        <p className="eyebrow" id="live-feed-eyebrow">
          <span className="live-dot" aria-hidden="true" /> Live public system
        </p>
        <h1 id="live-feed-heading">Live feed from the public system.</h1>
        <p>
          Trustworthy, continuously refreshed announcements, ministry notifications, and clearly
          labelled reputable reporting for Indian government schemes, scholarships, and welfare.
        </p>
      </header>

      <div className="updates-toolbar" aria-label="Feed controls">
        <div className="toolbar-top">
          <div className="status-indicator">
            <span className="pulse-indicator" aria-hidden="true" />
            <span className="refreshed-text">{refreshedAtDisplay}</span>
          </div>

          <div className="feed-search-wrap">
            <input
              type="search"
              className="feed-search-input"
              placeholder="Filter by keyword, scheme, or ministry…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search within live announcements"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <nav className="filter-tabs" aria-label="Filter by source type">
          <button
            type="button"
            className={`filter-tab ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            All <span className="tab-count">{counts.total}</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === 'official' ? 'is-active' : ''}`}
            onClick={() => setFilter('official')}
            aria-pressed={filter === 'official'}
          >
            Official Government <span className="tab-count">{counts.official}</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === 'ministry' ? 'is-active' : ''}`}
            onClick={() => setFilter('ministry')}
            aria-pressed={filter === 'ministry'}
          >
            Ministry <span className="tab-count">{counts.ministry}</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === 'reputable' ? 'is-active' : ''}`}
            onClick={() => setFilter('reputable')}
            aria-pressed={filter === 'reputable'}
          >
            Reputable News <span className="tab-count">{counts.reputable}</span>
          </button>
        </nav>
      </div>

      {status === 'loading' && (
        <section className="updates-grid updates-skeletons" aria-label="Loading announcements">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <div className="update-skeleton-card" key={key} aria-hidden="true" />
          ))}
        </section>
      )}

      {status === 'error' && (
        <div className="updates-state updates-state-error" role="alert">
          <p className="state-heading">Feed temporarily unavailable</p>
          <p className="state-description">
            We were unable to load live feed announcements from the public system. Please check your
            connection or try again.
          </p>
          <button type="button" className="retry-button" onClick={handleRetry}>
            Try again ↺
          </button>
        </div>
      )}

      {status === 'ready' && !filteredItems.length && (
        <div className="updates-state" role="status">
          <p className="state-heading">No announcements found</p>
          <p className="state-description">
            {searchQuery
              ? `No announcements match “${searchQuery}”. Try a broader keyword.`
              : 'No announcements are available for the selected source category.'}
          </p>
          {(searchQuery || filter !== 'all') && (
            <button
              type="button"
              className="retry-button"
              onClick={() => {
                setFilter('all')
                setSearchQuery('')
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {status === 'ready' && filteredItems.length > 0 && (
        <section
          className="updates-grid"
          aria-live="polite"
          aria-labelledby="live-feed-heading"
        >
          {filteredItems.map((item) => {
            const isOfficial = item.source_type === 'official'
            const isMinistry = item.source_type === 'ministry'
            const badgeLabel = isOfficial ? 'Official' : isMinistry ? 'Ministry' : 'Reputable news'
            const badgeClass = isOfficial ? 'badge-official' : isMinistry ? 'badge-ministry' : 'badge-news'

            const formattedDate = item.published_at
              ? new Date(item.published_at).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent'

            return (
              <article
                className="update-card"
                key={item.id || item.source_url}
                tabIndex={0}
              >
                <div className="update-meta">
                  <span className={`source-badge ${badgeClass}`}>{badgeLabel}</span>
                  <time dateTime={item.published_at || undefined}>{formattedDate}</time>
                </div>

                <h2>{item.displayTitle || item.title}</h2>

                {(item.displaySummary || item.summary) && (
                  <p>{item.displaySummary || item.summary}</p>
                )}

                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                  aria-label={`Read full source notice from ${item.source_name} (opens in new tab)`}
                >
                  Read source: {item.source_name} <span aria-hidden="true">↗</span>
                </a>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
