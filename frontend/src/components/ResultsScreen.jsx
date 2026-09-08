import { useMemo, useState } from 'react'
import './ResultsScreen.css'
import './VisualStack.css'
import { matchSchemes, getCategoryRecords, schemeCategoryNames } from '../data/fullSchemes'
import { getCopy, interpolate } from '../data/languages'
import { AnimatedList, CurvedLoop, LaserFlow, MagicBento, ScrollStack, StrokeText, Topography } from './VisualStack'

function ResultCard({ item, index, onSelect, copy }) {
  return <MagicBento className="result-card-shell" data-stack-card="true"><button type="button" className="result-card" onClick={() => onSelect(item)}><span className="result-card-index">{String(index + 1).padStart(2, '0')}</span><span className="result-card-category">{item.category}</span><strong>{item.displayName || item.name}</strong><p>{item.reason || item.plainEligibility}</p><span className="result-card-meta"><b>{copy.matched}</b><span>{copy.opening.replace('{name}', item.displayName || item.name)} ↗</span></span></button></MagicBento>
}

export default function ResultsScreen({ answers, matches, onEdit, onItemSelect }) {
  const copy = getCopy(answers?.language || 'English').results
  const items = matches ?? matchSchemes(answers)
  const [selected, setSelected] = useState(null)
  const category = schemeCategoryNames[answers?.category] || answers?.category || 'Support'
  const total = getCategoryRecords(answers?.category || '').length
  const visible = useMemo(() => items.slice(0, 24), [items])
  const choose = (item) => { setSelected(item); onItemSelect?.(item) }
  const loopCopy = `OFFICIAL SOURCE · CHECKED RECORD · PERSONAL ROUTE · ${category.toUpperCase()} · `

  return <main className="results-page results-page-rebuilt"><Topography /><LaserFlow /><header className="results-header"><button className="edit-answers-link" type="button" onClick={onEdit}><span aria-hidden="true">←</span> {copy.back}</button><StrokeText className="results-step">STEP 03 / 04 · MATCH FEED</StrokeText><span className="results-status">{category.toUpperCase()} / LIVE</span></header><section className="results-rebuilt-layout"><div className="results-rebuilt-heading"><p className="eyebrow"><span className="signal-dot" />MATCH ENGINE / {category.toUpperCase()}</p><h1>{copy.title}<br /><StrokeText as="em">{copy.titleEm}.</StrokeText></h1><p>{copy.lede}</p><div className="results-live-fact"><strong>{total || items.length}</strong><span>records in this category</span><small>Current local catalogue · verify each official source</small></div><div className="results-stack-legend"><span>01</span><i /><span>TOPography</span><i /> <span>LIST</span><i /> <span>STACK</span></div></div><div className="results-feed-wrap"><div className="results-feed-head"><span>{copy.matched}</span><span>{visible.length.toString().padStart(2, '0')}</span></div>{visible.length ? <AnimatedList><ScrollStack className="results-feed" role="listbox" aria-label={copy.matched}>{visible.map((item, index) => <ResultCard key={item.id} item={item} index={index} onSelect={choose} copy={copy} />)}</ScrollStack></AnimatedList> : <div className="results-empty"><strong>{copy.empty}</strong><p>{copy.lede}</p><button type="button" onClick={onEdit}>{copy.edit} ↗</button></div>}{selected && <p className="results-selection" role="status">{interpolate(copy.opening, { name: selected.displayName || selected.name })}</p>}</div></section><CurvedLoop>{loopCopy}</CurvedLoop></main>
}
