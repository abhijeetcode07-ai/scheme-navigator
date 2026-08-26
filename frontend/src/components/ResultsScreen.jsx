import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './ResultsScreen.css'
import { matchSchemes } from '../data/schemes'

function GlareHover({ children, glareColor = '#E8A33D', glareOpacity = 0.25, glareAngle = -30, transitionDuration = 500 }) {
  return (
    <div
      className="glare-hover"
      style={{
        '--glare-color': glareColor,
        '--glare-opacity': glareOpacity,
        '--glare-angle': `${glareAngle}deg`,
        '--glare-duration': `${transitionDuration}ms`,
      }}
    >
      {children}
    </div>
  )
}

function AnimatedList({ items, showGradients = true, enableArrowNavigation = true, displayScrollbar = true, onItemSelect }) {
  const listRef = useRef(null)
  const rowRefs = useRef([])
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, items.length)
  }, [items.length])

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
      <div className="animated-list" ref={listRef} role="listbox" aria-label="Matched schemes">
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
                className={`scheme-row ${activeIndex === index ? 'is-active' : ''}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                ref={(element) => { rowRefs.current[index] = element }}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onClick={() => onItemSelect(item)}
              >
                <span className="scheme-index">0{index + 1}</span>
                <span className="scheme-copy">
                  <strong>{item.name}</strong>
                  <span>{item.reason}</span>
                </span>
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

export default function ResultsScreen({ answers, matches, onEdit, onItemSelect }) {
  const items = matches ?? matchSchemes(answers)
  const hasMatches = items.length > 0
  const [selectedItem, setSelectedItem] = useState(null)

  const selectItem = (item) => {
    setSelectedItem(item)
    onItemSelect?.(item)
  }

  return (
    <main className="results-page">
      <header className="results-header">
        <button className="edit-answers-link" type="button" onClick={onEdit}>
          <span aria-hidden="true">←</span> Edit my answers
        </button>
        <span className="results-step">STEP 02 <span aria-hidden="true">/</span> YOUR MATCHES</span>
      </header>
      <section className="results-content" aria-labelledby="results-title">
        <div className="results-heading">
          <p className="eyebrow">A clearer next step</p>
          <h1 id="results-title">Here’s what you<br /><em>may qualify for</em></h1>
          <p className="results-lede">A shortlist to start with. Open any scheme to see the plain-language why, the documents, and where to apply.</p>
        </div>
        {hasMatches ? (
          <AnimatedList
            items={items}
            showGradients
            enableArrowNavigation
            displayScrollbar
            onItemSelect={selectItem}
          />
        ) : (
          <div className="empty-state" role="status">
            <span className="empty-mark" aria-hidden="true">—</span>
            <p>No exact matches yet — try adjusting your answers</p>
            <button className="empty-edit-link" type="button" onClick={onEdit}>Edit my answers <span aria-hidden="true">→</span></button>
          </div>
        )}
        {selectedItem && <p className="selection-hint" role="status">Opening <strong>{selectedItem.name}</strong>…</p>}
      </section>
    </main>
  )
}
