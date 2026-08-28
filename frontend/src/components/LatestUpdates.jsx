import { useEffect, useState } from 'react'
import { fetchLatestFeed, listPublishedFeed } from '../lib/catalog'
import './LatestUpdates.css'

export default function LatestUpdates({ language = 'English', onBack }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    fetchLatestFeed({ limit: 40 })
      .then((result) => { if (active) { setItems(result.data || []); setStatus('ready') } })
      .catch(async () => {
        try {
          const fallback = await listPublishedFeed({ languageCode: language, limit: 40 })
          if (active) { setItems(fallback); setStatus('ready') }
        } catch { if (active) setStatus('error') }
      })
    return () => { active = false }
  }, [language])

  return <main className="updates-page"><header className="updates-header"><button type="button" className="back-link" onClick={onBack}><span aria-hidden="true">←</span> Back to SchemeSetu</button><p className="eyebrow">The public record</p><h1>Latest government updates.</h1><p>Official announcements, ministry notifications, and reputable reporting gathered with visible source attribution.</p></header>{status === 'loading' && <div className="updates-state">Loading the latest verified updates…</div>}{status === 'error' && <div className="updates-state">Updates are temporarily unavailable. Please try again soon.</div>}{status === 'ready' && !items.length && <div className="updates-state">No published updates are available yet.</div>}{status === 'ready' && items.length > 0 && <section className="updates-grid" aria-live="polite">{items.map((item) => <article className="update-card" key={item.id || item.source_url}><div className="update-meta"><span>{item.source_type === 'official' || item.source_type === 'ministry' ? 'Official' : 'Reputable news'}</span><time dateTime={item.published_at || undefined}>{item.published_at ? new Date(item.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</time></div><h2>{item.displayTitle || item.title}</h2>{(item.displaySummary || item.summary) && <p>{item.displaySummary || item.summary}</p>}<a href={item.source_url} target="_blank" rel="noreferrer">Read source: {item.source_name} <span aria-hidden="true">↗</span></a></article>)}</section>}</main>
}
