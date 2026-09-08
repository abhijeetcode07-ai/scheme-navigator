import { useEffect, useState } from 'react'
import { fetchLatestFeed } from '../lib/catalog'

export default function LatestFeed({ language = 'English', onOpenFeed }) {
  const [items, setItems] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    let active = true
    fetchLatestFeed({ limit: 3 })
      .then((result) => { if (active) { setItems(result.data || []); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [language])

  if (state === 'error' || (state === 'ready' && !items.length)) return null

  return (
    <section className="latest-feed-section" id="live-feed" aria-labelledby="latest-feed-title">
      <div className="section-label-row">
        <div>
          <p className="eyebrow">Live feed</p>
          <h2 id="latest-feed-title" style={{ margin: '8px 0 0', fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}>
            Continuous public updates.
          </h2>
        </div>
        {onOpenFeed && (
          <button type="button" className="text-link" onClick={onOpenFeed}>
            Open full live feed <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <div className="latest-feed-grid">
        {state === 'loading'
          ? [1, 2, 3].map((item) => <div className="feed-skeleton" key={item} aria-hidden="true" />)
          : items.map((item) => {
              const badgeLabel = item.source_type === 'official' ? 'Official' : item.source_type === 'ministry' ? 'Ministry' : 'Reputable news'
              const badgeClass = item.source_type === 'official' ? 'badge-official' : item.source_type === 'ministry' ? 'badge-ministry' : 'badge-news'
              return (
                <article className="feed-card" key={item.id || item.source_url}>
                  <div className="feed-card-meta">
                    <span className={`feed-badge ${badgeClass}`}>{badgeLabel}</span>
                    <time dateTime={item.published_at || undefined}>
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Recent'}
                    </time>
                  </div>
                  <h3>{item.displayTitle || item.title}</h3>
                  {(item.displaySummary || item.summary) && <p>{item.displaySummary || item.summary}</p>}
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                    Read source: {item.source_name} <span aria-hidden="true">↗</span>
                  </a>
                </article>
              )
            })}
      </div>
    </section>
  )
}
