import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './ResultsScreen.css'
import { getCopy, interpolate } from '../data/languages'
import { matchSchemes } from '../data/schemes'

function GlareHover({ children, glareColor = '#E8A33D', glareOpacity = 0.25, glareAngle = -30, transitionDuration = 500 }) {
  return (
    <div
      className="glare-hover"
      style={{ '--glare-color': glareColor, '--glare-opacity': glareOpacity, '--glare-angle': `${glareAngle}deg`, '--glare-duration': `${transitionDuration}ms` }}
    >
      {children}
    </div>
  )
}

function AnimatedList({ items, showGradients = true, enableArrowNavigation = true, displayScrollbar = true, onItemSelect, ariaLabel }) {
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
    if (enableArrowNavigation && event.key === 'ArrowDown') {
      event.preventDefault()
      focusRow(index + 1)
    } else if (enableArrowNavigation && event.key === 'ArrowUp') {
      event.preventDefault()
      focusRow(index - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onItemSelect(items[index])
    }
  }

  return (
    <div className={`animated-list-shell ${showGradients ? 'has-gradients' : ''} ${displayScrollbar ? 'show-scrollbar' : 'hide-scrollbar'}`}>
      {showGradients && <span className="list-gradient list-gradient-top" aria-hidden="true" />}
      <div className="animated-list" role="listbox" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <motion.div
            className="animated-list-item"
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: .4, delay: index * .07, ease: [0.23, 1, 0.32, 1] }}
          >
            <GlareHover glareColor="#E8A33D" glareOpacity={0.25} glareAngle={-30} transitionDuration={500}>
              <button
                className={`scheme-row ${safeActiveIndex === index ? 'is-active' : ''}`}
                type="button"
                role="option"
                aria-selected={safeActiveIndex === index}
                ref={(element) => { rowRefs.current[index] = element }}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onClick={() => onItemSelect(item)}
              >
                <span className="scheme-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="scheme-copy"><strong>{item.name}</strong><span>{item.reason}</span></span>
                <span className="scheme-chevron" aria-hidden="true">↗</span>
              </button>
            </GlareHover>
          </motion.div>
        ))}
      </div>
      {showGradients && <span className="list-gradient list-gradient-bottom" aria-hidden="true" />}
    </div>
  )
}

export default function ResultsScreen({ answers, matches, onEdit, onItemSelect, aiStatus }) {
  const items = matches ?? matchSchemes(answers)
  const hasMatches = items.length > 0
  const language = answers?.language
  const copy = getCopy(language).results
  const [selectedItem, setSelectedItem] = useState(null)

  const selectItem = (item) => {
    setSelectedItem(item)
    onItemSelect?.(item)
  }

  return (
    <main className="results-page">
      <header className="results-header">
        <button className="edit-answers-link" type="button" onClick={onEdit}><span aria-hidden="true">←</span> {copy.back}</button>
        <span className="results-step">{copy.step}</span>
      </header>
      <section className="results-content" aria-labelledby="results-title">
        <div className="results-heading">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="results-title">{copy.title}<br /><em>{copy.titleEm}</em></h1>
          <p className="results-lede">{copy.lede}</p>
          {aiStatus && <p className={`ai-status ai-status-${aiStatus.kind}`} role="status" aria-live="polite">{aiStatus.message}</p>}
        </div>
        {hasMatches ? (
          <AnimatedList items={items} showGradients enableArrowNavigation displayScrollbar ariaLabel={copy.matched} onItemSelect={selectItem} />
        ) : (
          <div className="empty-state" role="status">
            <span className="empty-mark" aria-hidden="true">—</span>
            <p>{copy.empty}</p>
            <button className="empty-edit-link" type="button" onClick={onEdit}>{copy.edit} <span aria-hidden="true">→</span></button>
          </div>
        )}
        {selectedItem && <p className="selection-hint" role="status">{interpolate(copy.opening, { name: selectedItem.name })}</p>}
      </section>
    </main>
  )
}
