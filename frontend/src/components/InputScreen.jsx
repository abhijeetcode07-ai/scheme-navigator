import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './InputScreen.css'

const introLines = [
  "Let's find what you qualify for.",
  'This takes about two minutes.',
  'Feel free to describe your situation in your own words too.',
]

const options = {
  language: ['Hindi', 'English'],
  education: ['School', 'Undergraduate', 'Postgraduate'],
  category: ['General', 'OBC', 'SC', 'ST', 'Minority'],
  income: ['Below ₹1L', '₹1L–₹2.5L', '₹2.5L–₹5L', 'Above ₹5L'],
}

function CursorGrid() {
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: -1000, y: -1000, movedAt: 0 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined
    let animationFrame
    let width = 0
    let height = 0
    const cellSize = 90
    const radius = 110
    const color = '232, 163, 61'

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const handlePointerMove = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, movedAt: performance.now() }
    }

    const draw = (now) => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = 1
      const pointer = pointerRef.current
      const isFresh = !reduceMotion && now - pointer.movedAt < 600

      for (let x = 0; x <= width + cellSize; x += cellSize) {
        const distance = Math.abs(x - pointer.x)
        const influence = isFresh ? Math.max(0, 1 - distance / radius) : 0
        context.strokeStyle = `rgba(${color}, ${0.04 + influence * 0.12})`
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.stroke()
      }
      for (let y = 0; y <= height + cellSize; y += cellSize) {
        const distance = Math.abs(y - pointer.y)
        const influence = isFresh ? Math.max(0, 1 - distance / radius) : 0
        context.strokeStyle = `rgba(${color}, ${0.04 + influence * 0.12})`
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }

      if (isFresh) {
        const distance = Math.hypot(pointer.x - Math.round(pointer.x / cellSize) * cellSize, pointer.y - Math.round(pointer.y / cellSize) * cellSize)
        const glow = Math.max(0, 1 - distance / radius)
        const gradient = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius)
        gradient.addColorStop(0, `rgba(${color}, ${glow * 0.14})`)
        gradient.addColorStop(1, `rgba(${color}, 0)`)
        context.fillStyle = gradient
        context.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2)
      }
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    if (reduceMotion) draw(0)
    else animationFrame = window.requestAnimationFrame(draw)
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className="cursor-grid" aria-hidden="true" />
}

function TextType() {
  const reduceMotion = useReducedMotion()
  const [lineIndex, setLineIndex] = useState(0)
  const [visibleText, setVisibleText] = useState(reduceMotion ? introLines[0] : '')

  useEffect(() => {
    if (reduceMotion) return undefined

    let timeout
    let characterIndex = 0
    let currentLine = lineIndex
    const typeNext = () => {
      const line = introLines[currentLine]
      setVisibleText(line.slice(0, characterIndex + 1))
      characterIndex += 1
      if (characterIndex < line.length) {
        timeout = window.setTimeout(typeNext, 45)
      } else {
        timeout = window.setTimeout(() => {
          currentLine = (currentLine + 1) % introLines.length
          setLineIndex(currentLine)
        }, 1800)
      }
    }
    typeNext()
    return () => window.clearTimeout(timeout)
  }, [lineIndex, reduceMotion])

  return (
    <p className="assistant-intro" aria-live="polite">
      {visibleText}
      {!reduceMotion && <span className="typing-cursor" aria-hidden="true">|</span>}
    </p>
  )
}

function ChoiceGroup({ label, name, values, value, onChange }) {
  return (
    <fieldset className="choice-group">
      <legend>{label}</legend>
      <div className="choice-list">
        {values.map((option) => (
          <button
            className={`choice-chip ${value === option ? 'is-selected' : ''}`}
            type="button"
            key={option}
            aria-pressed={value === option}
            onClick={() => onChange(name, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function SpecularButton({ children, disabled, onClick }) {
  return (
    <button className="input-submit" type="submit" disabled={disabled} onClick={onClick}>
      <span>{children}</span>
      <span className="input-arrow" aria-hidden="true">↗</span>
    </button>
  )
}

export function ResultsScreen({ answers, onBack, onHome }) {
  const selections = [answers.language, answers.education, answers.category, answers.income].filter(Boolean)
  return (
    <main className="results-screen">
      <div className="results-card">
        <p className="eyebrow">Your starting point</p>
        <h1>We’ll shape the search<br /><em>around you.</em></h1>
        <p className="results-lede">Your answers are ready for the matching step. We’ll explain why each scheme fits, what to gather, and where to apply.</p>
        <div className="answer-summary" aria-label="Your selected answers">
          {selections.map((selection) => <span className="summary-chip" key={selection}>{selection}</span>)}
        </div>
        {answers.notes && <p className="notes-preview"><strong>In your words:</strong> {answers.notes}</p>}
        <div className="results-actions">
          <button className="input-submit" type="button" onClick={onBack}>Edit answers <span className="input-arrow" aria-hidden="true">↗</span></button>
          <button className="results-home" type="button" onClick={onHome}>Return home</button>
        </div>
      </div>
    </main>
  )
}

export default function InputScreen({ onSubmit, onBack }) {
  const reduceMotion = useReducedMotion()
  const [answers, setAnswers] = useState({ language: 'English', education: '', category: '', income: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const updateAnswer = (name, value) => setAnswers((current) => ({ ...current, [name]: value }))
  const isReady = Boolean(answers.language && answers.education && answers.category && answers.income)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isReady) {
      setSubmitted(true)
      return
    }
    onSubmit(answers)
  }

  return (
    <main className="input-page">
      <CursorGrid />
      <header className="input-nav">
        <button className="back-link" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> SchemeSetu
        </button>
        <span className="step-count">STEP 01 <span aria-hidden="true">/</span> ABOUT YOU</span>
      </header>
      <motion.div className="input-panel" initial={reduceMotion ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [0.23, 1, 0.32, 1] }}>
        <div className="panel-heading">
          <p className="eyebrow">A little context goes a long way</p>
          <h1>Let’s find your fit.</h1>
          <TextType />
        </div>
        <form onSubmit={handleSubmit}>
          <ChoiceGroup label="Preferred language" name="language" values={options.language} value={answers.language} onChange={updateAnswer} />
          <ChoiceGroup label="What are you studying?" name="education" values={options.education} value={answers.education} onChange={updateAnswer} />
          <ChoiceGroup label="Which category best describes you?" name="category" values={options.category} value={answers.category} onChange={updateAnswer} />
          <ChoiceGroup label="Approximate annual family income" name="income" values={options.income} value={answers.income} onChange={updateAnswer} />
          <label className="notes-field" htmlFor="situation-notes">
            <span>Anything else about your situation? <small>(optional)</small></span>
            <textarea id="situation-notes" value={answers.notes} onChange={(event) => updateAnswer('notes', event.target.value)} placeholder="For example: I am the first person in my family to attend college…" rows="4" />
          </label>
          {submitted && !isReady && <p className="form-message" role="alert">Choose one option in each section so we can start with a useful match.</p>}
          <div className="submit-row">
            <SpecularButton disabled={!isReady}>Find My Schemes</SpecularButton>
            <span className="privacy-note">Your answers stay here for this conversation.</span>
          </div>
        </form>
      </motion.div>
    </main>
  )
}
