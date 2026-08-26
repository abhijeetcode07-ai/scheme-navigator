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

function hexToRgb(hex) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((character) => `${character}${character}`).join('') : value
  const number = Number.parseInt(normalized, 16)
  return `${number >> 16}, ${(number >> 8) & 255}, ${number & 255}`
}

function CursorGrid({
  cellSize = 90,
  color = '#E8A33D',
  radius = 110,
  falloff = 'smooth',
  holdTime = 300,
  fadeDuration = 600,
  lineWidth = 1,
  maxOpacity = 0.35,
  fillOpacity = 0,
  gridOpacity = 0.04,
  clickPulse = false,
}) {
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
    const rgb = hexToRgb(color)

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

    const getInfluence = (distance, now) => {
      const pointerAge = now - pointerRef.current.movedAt
      if (reduceMotion || pointerAge >= holdTime + fadeDuration) return 0
      const distanceInfluence = falloff === 'smooth' ? Math.max(0, 1 - distance / radius) : distance < radius ? 1 : 0
      const timeInfluence = pointerAge <= holdTime ? 1 : Math.max(0, 1 - (pointerAge - holdTime) / fadeDuration)
      return distanceInfluence * timeInfluence
    }

    const draw = (now) => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = lineWidth
      const pointer = pointerRef.current

      for (let x = 0; x <= width + cellSize; x += cellSize) {
        const influence = getInfluence(Math.abs(x - pointer.x), now)
        const opacity = gridOpacity + influence * (maxOpacity - gridOpacity)
        context.strokeStyle = `rgba(${rgb}, ${opacity})`
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.stroke()
      }
      for (let y = 0; y <= height + cellSize; y += cellSize) {
        const influence = getInfluence(Math.abs(y - pointer.y), now)
        const opacity = gridOpacity + influence * (maxOpacity - gridOpacity)
        context.strokeStyle = `rgba(${rgb}, ${opacity})`
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }

      if (fillOpacity > 0) {
        const influence = getInfluence(0, now)
        const gradient = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius)
        gradient.addColorStop(0, `rgba(${rgb}, ${influence * fillOpacity})`)
        gradient.addColorStop(1, `rgba(${rgb}, 0)`)
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
  }, [cellSize, color, fadeDuration, falloff, fillOpacity, gridOpacity, holdTime, lineWidth, maxOpacity, radius, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      className="cursor-grid"
      data-cell-size={cellSize}
      data-click-pulse={clickPulse ? 'true' : 'false'}
      aria-hidden="true"
    />
  )
}

function TextType({ text, typingSpeed = 45, pauseDuration = 1800, loop = true, showCursor = true, textColors = ['#16233F'] }) {
  const reduceMotion = useReducedMotion()
  const [visibleText, setVisibleText] = useState(reduceMotion ? text[0] : '')

  useEffect(() => {
    if (reduceMotion) return undefined

    let cancelled = false
    let timeoutId
    let lineIndex = 0
    let characterIndex = 0

    const typeLine = () => {
      if (cancelled) return
      const line = text[lineIndex]
      characterIndex = 0
      setVisibleText('')

      const typeCharacter = () => {
        if (cancelled) return
        characterIndex += 1
        setVisibleText(line.slice(0, characterIndex))
        if (characterIndex < line.length) {
          timeoutId = window.setTimeout(typeCharacter, typingSpeed)
          return
        }
        timeoutId = window.setTimeout(() => {
          if (!loop && lineIndex === text.length - 1) return
          lineIndex = (lineIndex + 1) % text.length
          typeLine()
        }, pauseDuration)
      }

      timeoutId = window.setTimeout(typeCharacter, typingSpeed)
    }

    typeLine()
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [loop, pauseDuration, reduceMotion, text, typingSpeed])

  return (
    <p className="assistant-intro" aria-live="polite" style={{ color: textColors[0] }}>
      {visibleText}
      {showCursor && !reduceMotion && <span className="typing-cursor" aria-hidden="true">|</span>}
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

function SpecularButton({ children, disabled }) {
  return (
    <button className="input-submit" type="submit" disabled={disabled}>
      <span>{children}</span>
      <span className="input-arrow" aria-hidden="true">↗</span>
    </button>
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
      <CursorGrid
        cellSize={90}
        color="#E8A33D"
        radius={110}
        falloff="smooth"
        holdTime={300}
        fadeDuration={600}
        lineWidth={1}
        maxOpacity={0.35}
        fillOpacity={0}
        gridOpacity={0.04}
        clickPulse={false}
      />
      <header className="input-nav">
        <button className="back-link" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> SchemeSetu
        </button>
        <span className="step-count">STEP 01 <span aria-hidden="true">/</span> ABOUT YOU</span>
      </header>
      <motion.div className="input-panel" initial={reduceMotion ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [0.23, 1, 0.32, 1] }}>
        <div className="panel-heading">
          <div className="heading-copy">
            <p className="eyebrow">A little context goes a long way</p>
            <h1>Let’s find your fit.</h1>
          </div>
          <TextType text={introLines} typingSpeed={45} pauseDuration={1800} loop showCursor textColors={['#16233F']} />
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
