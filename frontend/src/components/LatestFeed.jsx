import { useEffect, useState } from 'react'
import { fetchLatestFeed } from '../lib/catalog'

export default function LatestFeed({ language = 'English' }) {
  const [items, setItems] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    let active = true
    fetchLatestFeed({ limit: 6 })
      .then((result) => { if (active) { setItems(result.data || []); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [language])

  if (state === 'error' || (state === 'ready' && !items.length)) return null

  return <section className="latest-feed-section" id="latest-updates" aria-labelledby="latest-feed-title">
    <div className="latest-feed-intro"><p className="eyebrow">Latest updates</p><h2 id="latest-feed-title">What changed recently.</h2><p>Official announcements and carefully attributed updates, collected in one calm place.</p></div>
    <div className="latest-feed-grid">{state === 'loading' ? [1, 2, 3].map((item) => <div className="feed-skeleton" key={item} aria-hidden="true" />) : items.map((item) => <article className="feed-card" key={item.id || item.source_url}><div className="feed-card-meta"><span>{item.source_type === 'official' || item.source_type === 'ministry' ? 'Official source' : 'Reputable news'}</span><time dateTime={item.published_at || undefined}>{item.published_at ? new Date(item.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</time></div><h3>{item.displayTitle || item.title}</h3>{(item.displaySummary || item.summary) && <p>{item.displaySummary || item.summary}</p>}<a href={item.source_url} target="_blank" rel="noreferrer">Read from {item.source_name} <span aria-hidden="true">↗</span></a></article>)}</div>
  </section>
}
