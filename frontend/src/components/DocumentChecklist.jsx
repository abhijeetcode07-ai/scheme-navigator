import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './DocumentChecklist.css'
import { getCopy, getDetailFallback, interpolate } from '../data/languages'

function GlareHover({ children, glareColor = '#E8A33D', glareOpacity = 0.16, glareAngle = -30, transitionDuration = 500 }) {
  return <div className="checklist-glare" style={{ '--glare-color': glareColor, '--glare-opacity': glareOpacity, '--glare-angle': `${glareAngle}deg`, '--glare-duration': `${transitionDuration}ms` }}>{children}</div>
}

function AnimatedChecklist({ items, onToggle, showGradients = true, enableArrowNavigation = true, displayScrollbar = true, copy }) {
  const rowRefs = useRef([])
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, items.length)
  }, [items.length])

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, items.length - 1))

  const focusRow = (index) => {
    if (!items.length) return
    const nextIndex = (index + items.length) % items.length
    setActiveIndex(nextIndex)
    rowRefs.current[nextIndex]?.focus()
    rowRefs.current[nextIndex]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' })
  }

  const handleKeyDown = (event, index) => {
    if (enableArrowNavigation && event.key === 'ArrowDown') { event.preventDefault(); focusRow(index + 1) }
    else if (enableArrowNavigation && event.key === 'ArrowUp') { event.preventDefault(); focusRow(index - 1) }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(items[index].id) }
  }

  return <div className={`checklist-list-shell ${showGradients ? 'has-gradients' : ''} ${displayScrollbar ? 'show-scrollbar' : 'hide-scrollbar'}`}>
    {showGradients && <span className="checklist-gradient checklist-gradient-top" aria-hidden="true" />}
    <div className="checklist-list" role="group" aria-label={copy.aria}>
      {items.map((item, index) => <motion.div className="checklist-list-item" key={item.id} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0 } : { duration: .4, delay: index * .06, ease: [0.23, 1, 0.32, 1] }}>
        <GlareHover><button ref={(element) => { rowRefs.current[index] = element }} className={`checklist-row ${item.checked ? 'is-checked' : ''} ${safeActiveIndex === index ? 'is-active' : ''}`} type="button" role="checkbox" aria-checked={item.checked} onFocus={() => setActiveIndex(index)} onKeyDown={(event) => handleKeyDown(event, index)} onClick={() => onToggle(item.id)}>
          <span className="checklist-box" aria-hidden="true">{item.checked ? '✓' : ''}</span><span className="checklist-label">{item.label}</span><span className="checklist-toggle-hint" aria-hidden="true">{item.checked ? copy.ready : copy.checkOff}</span>
        </button></GlareHover>
      </motion.div>)}
    </div>
    {showGradients && <span className="checklist-gradient checklist-gradient-bottom" aria-hidden="true" />}
  </div>
}

function MagicRings({ color = '#E8A33D', colorTwo = '#2F7A6B', ringCount = 4, speed = 1.4, opacity = .8, clickBurst = false, followMouse = false, reduceMotion = false }) {
  return <div className={`magic-rings ${reduceMotion ? 'reduce-motion' : ''}`} aria-hidden="true" style={{ '--ring-one': color, '--ring-two': colorTwo, '--ring-opacity': opacity, '--ring-speed': `${speed}s`, '--ring-count': ringCount }} data-click-burst={clickBurst} data-follow-mouse={followMouse}>{Array.from({ length: ringCount }, (_, index) => <span className="magic-ring" key={index} style={{ '--ring-index': index }} />)}</div>
}

function SpecularButton({ children, variant = 'primary', size = 'lg', intensity = 1, onClick, disabled = false }) {
  return <button className={`checklist-specular-button checklist-specular-${variant} checklist-specular-${size}`} type="button" style={{ '--button-intensity': intensity }} onClick={onClick} disabled={disabled}><span>{children}</span><span className="checklist-button-arrow" aria-hidden="true">↗</span></button>
}

export default function DocumentChecklist({ scheme, localizedDocuments, onBack, language }) {
  const reduceMotion = useReducedMotion()
  const copy = getCopy(language).checklist
  const documents = localizedDocuments?.length ? localizedDocuments : language === 'English' && scheme?.documents?.length ? scheme.documents : [getDetailFallback(language).document]
  const [items, setItems] = useState(() => documents.map((label, index) => ({ id: `${scheme?.id ?? 'scheme'}-document-${index}`, label, checked: false })))
  const [celebrating, setCelebrating] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const celebrationTimer = useRef(null)

  useEffect(() => () => { if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current) }, [])

  const startCelebration = () => {
    if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current)
    setCelebrating(true)
    celebrationTimer.current = window.setTimeout(() => setCelebrating(false), 1800)
  }

  const toggleItem = (id) => {
    const nextItems = items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item)
    setItems(nextItems)
    if (nextItems.length > 0 && nextItems.every((item) => item.checked)) startCelebration()
  }

  const checkedCount = items.filter((item) => item.checked).length
  const totalCount = items.length
  const progress = totalCount ? (checkedCount / totalCount) * 100 : 0
  const checklistText = items.map((item) => `${item.checked ? '✓' : '□'} ${item.label}`).join('\n')

  const copyChecklist = async () => {
    try { await navigator.clipboard.writeText(checklistText); setCopyStatus(copy.copied) }
    catch { setCopyStatus(copy.copyUnavailable) }
    window.setTimeout(() => setCopyStatus(''), 2200)
  }

  if (!scheme) return null

  return <main className={`checklist-page ${reduceMotion ? 'reduce-motion' : ''}`}>
    <header className="checklist-header"><button className="checklist-back" type="button" onClick={onBack}><span aria-hidden="true">←</span> {copy.back}</button><span className="checklist-step">{copy.step}</span></header>
    <section className="checklist-content" aria-labelledby="checklist-title">
      <div className="checklist-heading-row"><div><p className="eyebrow">{copy.eyebrow}</p><h1 id="checklist-title">{copy.title}<br /><em>{copy.titleEm}</em></h1></div><div className="checklist-progress-copy" aria-live="polite"><strong>{checkedCount}</strong><span> / {totalCount} {copy.checked}</span></div></div>
      <p className="checklist-lede">{interpolate(copy.lede, { name: scheme.name })}</p>
      <div className="checklist-progress" role="progressbar" aria-label={interpolate(copy.progressAria, { checked: checkedCount, total: totalCount })} aria-valuemin="0" aria-valuemax={totalCount} aria-valuenow={checkedCount}><span style={{ width: `${progress}%` }} /></div>
      <AnimatedChecklist items={items} onToggle={toggleItem} showGradients enableArrowNavigation displayScrollbar copy={copy} />
      <div className="checklist-actions"><SpecularButton onClick={copyChecklist}>{copy.copy}</SpecularButton><SpecularButton variant="secondary" size="md" intensity={.6} onClick={onBack}>{copy.backDetails}</SpecularButton></div>
      <p className="copy-status" role="status" aria-live="polite">{copyStatus}</p>
      {celebrating && <motion.div className="completion-moment" initial={reduceMotion ? false : { opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }}><MagicRings color="#E8A33D" colorTwo="#2F7A6B" ringCount={4} speed={1.4} opacity={.8} clickBurst={false} followMouse={false} reduceMotion={reduceMotion} /><strong>{copy.completion}</strong></motion.div>}
      <p className="checklist-disclaimer">{copy.disclaimer}</p>
    </section>
  </main>
}
