import { useMemo, useState } from 'react'
import './ResultsScreen.css'
import { matchSchemes, getCategoryRecords, schemeCategoryNames } from '../data/fullSchemes'

function ResultCard({ item, index, onSelect }) {
  return <button type="button" className="result-card" onClick={() => onSelect(item)}><span className="result-card-index">{String(index + 1).padStart(2, '0')}</span><span className="result-card-category">{item.category}</span><strong>{item.displayName || item.name}</strong><p>{item.reason || item.plainEligibility}</p><span className="result-card-meta"><b>{item.benefits || 'Benefit details on official record'}</b><span>Open scheme detail ↗</span></span></button>
}

export default function ResultsScreen({ answers, matches, onEdit, onItemSelect }) {
  const items = matches ?? matchSchemes(answers)
  const [selected, setSelected] = useState(null)
  const category = schemeCategoryNames[answers?.category] || answers?.category || 'Support'
  const total = getCategoryRecords(answers?.category || '').length
  const visible = useMemo(() => items.slice(0, 24), [items])
  const choose = (item) => { setSelected(item); onItemSelect?.(item) }
  return <main className="results-page results-page-rebuilt"><div className="results-topography" aria-hidden="true" /><header className="results-header"><button className="edit-answers-link" type="button" onClick={onEdit}><span aria-hidden="true">←</span> Edit route signal</button><span className="results-step">STEP 03 / 04 · MATCH FEED</span><span className="results-status">{category.toUpperCase()} / LIVE</span></header><section className="results-rebuilt-layout"><div className="results-rebuilt-heading"><p className="eyebrow"><span className="signal-dot" />MATCH ENGINE / {category.toUpperCase()}</p><h1>These routes<br /><em>fit your signal.</em></h1><p>We ranked {items.length} active records from the {category} catalogue. Open any route to inspect its eligibility, benefit, source, and application path.</p><div className="results-live-fact"><strong>{total || items.length}</strong><span>records in this category</span><small>Current local catalogue · verify each official source</small></div></div><div className="results-feed-wrap"><div className="results-feed-head"><span>01 / BEST MATCHES</span><span>{visible.length.toString().padStart(2, '0')} SHOWN</span></div>{visible.length ? <div className="results-feed" role="listbox" aria-label="Matched schemes">{visible.map((item, index) => <ResultCard key={item.id} item={item} index={index} onSelect={choose} />)}</div> : <div className="results-empty"><strong>No exact routes yet.</strong><p>Try editing your route signal and choose a broader answer.</p><button type="button" onClick={onEdit}>Edit answers ↗</button></div>}{selected && <p className="results-selection" role="status">Opening {selected.displayName || selected.name} …</p>}</div></section><div className="results-curved-loop" aria-hidden="true"><span>OFFICIAL SOURCE · CHECKED RECORD · PERSONAL ROUTE · {category.toUpperCase()} · </span><span>OFFICIAL SOURCE · CHECKED RECORD · PERSONAL ROUTE · {category.toUpperCase()} · </span></div></main>
}
