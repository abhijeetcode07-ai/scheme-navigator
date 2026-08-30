import { useState } from 'react'
import './SchemeDetail.css'
import './VisualStack.css'
import { categoryRecordCounts } from '../data/fullSchemes'
import { BorderGlow, ShapeGrid, Stepper } from './VisualStack'

function isRealLink(link) { return typeof link === 'string' && /^https?:\/\//i.test(link.trim()) }
function firstLink(value) { return String(value || '').match(/https?:\/\/[^\s)]+/i)?.[0] || '' }
function DetailPanel({ label, title, children, active = false }) { return <section className={`detail-panel ${active ? 'is-active' : ''}`}><p className="detail-panel-label">{label}</p><h2>{title}</h2><div className="detail-panel-body">{children}</div></section> }
function firstCurrency(value = '') { return value.match(/₹\s*[\d,]+(?:\.\d+)?(?:\s*\/\s*(?:month|year|annum))?/i)?.[0] || '' }
function isMissing(value) { return !value || /not stated|not specified|verify current|no url supplied|research date/i.test(value) }

export default function SchemeDetail({ scheme, aiDetail, aiStatus, onBack, onChecklist }) {
  const [activeStage, setActiveStage] = useState(1)
  if (!scheme) return null
  const displayName = aiDetail?.name || scheme.displayName || scheme.name
  const applyLink = firstLink(scheme.officialApplyLink) || firstLink(scheme.verificationSourceLink)
  const documents = aiDetail?.documents?.length ? aiDetail.documents : scheme.documents || []
  const routeRecords = categoryRecordCounts[scheme.category] || 0
  const recordedAmount = firstCurrency(scheme.benefits || '') || firstCurrency(scheme.premium || '')
  const target = !isMissing(scheme.targetBeneficiary) ? scheme.targetBeneficiary : 'Not stated in record'
  const stages = ['Eligibility', 'Benefits', 'Apply', 'Verify']
  const stageTitles = ['Eligibility in plain language', 'Benefits and coverage', 'Application pathway', 'Before you decide']
  const stageLabel = ['01 / WHY THIS ROUTE', '02 / WHAT IT OPENS', '03 / SOURCE TRACE', '04 / RESEARCH NOTE']
  const stageContent = [
    <><p>{aiDetail?.why || scheme.plainEligibility || scheme.officialEligibility || 'Review the official record before applying.'}</p>{scheme.ageEligibility && <p className="detail-note"><b>Age signal:</b> {scheme.ageEligibility}</p>}{scheme.incomeCeiling && <p className="detail-note"><b>Income signal:</b> {scheme.incomeCeiling}</p>}</>,
    <><p>{aiDetail?.support || scheme.benefits || 'Benefit details are not stated in this record.'}</p>{scheme.premium && <p className="detail-note"><b>Cost or contribution:</b> {scheme.premium}</p>}</>,
    <><p>{scheme.applicationMode || 'Follow the official source for the current application process.'}</p><p className="detail-note"><b>Application window:</b> {scheme.applicationWindow || 'Check the official portal.'}</p><div className="detail-actions"><button className="detail-primary" type="button" onClick={onChecklist}>Build document checklist <span>↗</span></button>{isRealLink(applyLink) ? <a className="detail-secondary" href={applyLink} target="_blank" rel="noreferrer">Open official portal ↗</a> : <span className="detail-unavailable">Portal link needs verification</span>}</div></>,
    <><p>{scheme.notesFlags || 'No additional notes were supplied in the current record.'}</p>{scheme.verificationSourceLink && <a className="detail-source-link" href={firstLink(scheme.verificationSourceLink) || undefined} target="_blank" rel="noreferrer">View source reference ↗</a>}</>,
  ]
  const dashboard = [{ value: recordedAmount || 'See benefits', label: 'recorded support' }, { value: target, label: 'target beneficiary' }, { value: routeRecords || '—', label: 'records in route' }, { value: documents.length || '—', label: 'document signals' }]

  return <main className="scheme-detail-page scheme-detail-rebuilt"><ShapeGrid /><header className="detail-header"><button className="detail-back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to match feed</button><span className="detail-step">STEP 04 / 04 · SCHEME DOSSIER</span><span className="detail-live">VERIFIED RECORD</span></header><section className="detail-rebuilt-hero"><div className="detail-rebuilt-title"><p className="eyebrow"><span className="signal-dot" />{scheme.category} / {scheme.sourceType === 'existing-verified' ? 'CORE DATASET' : 'MASTER DOSSIER'}</p><h1>{displayName}</h1><p className="detail-ministry">{aiDetail?.ministry || scheme.ministry || 'Government of India'}</p><p className="detail-verification">Last verified: <strong>{scheme.lastVerifiedDate || 'Not stated'}</strong></p>{aiStatus && <p className="detail-ai-status" role="status">{aiStatus.message}</p>}</div><BorderGlow className="detail-dashboard-glow"><div className="detail-dashboard"><div className="detail-dashboard-head"><span>RECORD DASHBOARD</span><small>DATASET VALUES ONLY · NO ESTIMATES</small></div><div className="detail-stats-grid">{dashboard.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></div></BorderGlow></section><section className="detail-rebuilt-content"><div className="detail-stage-nav"><div className="detail-stage-intro"><span>READ THE DOSSIER</span><strong>Move through the route in four checks.</strong></div><Stepper steps={stages} current={activeStage} /></div><div className="detail-stage-tabs" role="tablist" aria-label="Scheme detail stages">{stages.map((stage, index) => <button type="button" key={stage} className={activeStage === index + 1 ? 'is-active' : ''} onClick={() => setActiveStage(index + 1)} role="tab" aria-selected={activeStage === index + 1}><span>{String(index + 1).padStart(2, '0')}</span>{stage}</button>)}</div><div className="detail-rebuilt-grid">{stageContent.map((content, index) => <DetailPanel key={stageTitles[index]} label={stageLabel[index]} title={stageTitles[index]} active={activeStage === index + 1}>{content}</DetailPanel>)}</div></section><footer className="detail-footer">SchemeSetu helps you find the route. The official department decides eligibility and approval.</footer></main>
}
