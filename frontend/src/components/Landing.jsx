import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './Landing.css'

const categoryLabels = [
  'Merit Scholarships',
  'Minority Scholarships',
  'Post-Matric Support',
  'Girl-Child Education',
  'Disability Support',
  'SC/ST/OBC Schemes',
]

const featureCards = [
  {
    number: '01',
    title: 'Conversation, not a form',
    description:
      'Answer a few plain questions, and add anything else in your own words — no jargon required.',
  },
  {
    number: '02',
    title: 'Explained like a person would',
    description:
      '“You qualify because you’re a first-gen student under 25 with income below the limit” — not a raw filtered list.',
  },
  {
    number: '03',
    title: 'A document checklist, ready to go',
    description:
      'Know exactly what to gather before you apply — the single biggest reason applicants give up.',
  },
  {
    number: '04',
    title: 'Built for regional languages',
    description:
      'Every explanation is generated directly in the language you choose, not machine-translated after the fact.',
  },
]

function BubbleMenu() {
  const [open, setOpen] = useState(false)
  const items = [
    ['Home', '#top'],
    ['How it works', '#how-it-works'],
    ['Schemes we cover', '#schemes'],
    ['Language', '#language'],
  ]

  return (
    <header className="site-nav" aria-label="Primary navigation">
      <a className="wordmark" href="#top" aria-label="SchemeSetu home">
        <span className="wordmark-mark" aria-hidden="true">S</span>
        SchemeSetu
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="main-menu"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((current) => !current)}
      >
        <span />
        <span />
      </button>
      <nav id="main-menu" className={`bubble-menu ${open ? 'is-open' : ''}`}>
        {items.map(([label, href], index) => (
          <a
            key={label}
            className={`bubble-link bubble-link-${index + 1}`}
            href={href}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}

function MoltenMetal() {
  return (
    <div className="molten-metal" aria-hidden="true">
      <div className="molten-orb molten-orb-one" />
      <div className="molten-orb molten-orb-two" />
      <div className="molten-orb molten-orb-three" />
      <div className="grain" />
    </div>
  )
}

function ParticleText({ children }) {
  const words = children.split(' ')
  return (
    <span className="particle-text" aria-label={children}>
      {words.map((word, index) => (
        <span className={index === 2 || index === 4 ? 'particle-word highlight-word' : 'particle-word'} key={`${word}-${index}`}>
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

function ShinyText({ children }) {
  return <span className="shiny-text">{children}</span>
}

function SpecularButton({ children, onClick }) {
  return (
    <button className="specular-button" type="button" onClick={onClick}>
      <span>{children}</span>
      <span className="button-arrow" aria-hidden="true">↗</span>
    </button>
  )
}

function LogoLoop() {
  return (
    <div className="logo-loop" aria-label="Scheme categories we cover">
      <div className="logo-loop-track">
        {[...categoryLabels, ...categoryLabels].map((label, index) => (
          <span className="category-chip" key={`${label}-${index}`}>
            <span className="chip-dot" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function MagicBento() {
  return (
    <div className="feature-grid">
      {featureCards.map((card) => (
        <article className="feature-card" key={card.number}>
          <div className="feature-card-top">
            <span className="feature-number">{card.number}</span>
            <span className="feature-spark" aria-hidden="true">✦</span>
          </div>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </article>
      ))}
    </div>
  )
}

function ScrollExpand() {
  return (
    <section className="how-section" id="how-it-works" aria-labelledby="how-title">
      <div className="how-copy">
        <p className="eyebrow">The simple flow</p>
        <h2 id="how-title">How it works</h2>
        <p className="scroll-hint">Scroll to see the flow <span aria-hidden="true">↓</span></p>
      </div>
      <div className="flow-card">
        <div className="flow-art" aria-hidden="true">
          <div className="flow-sun" />
          <div className="flow-line flow-line-a" />
          <div className="flow-line flow-line-b" />
          <div className="flow-line flow-line-c" />
        </div>
        <ol className="flow-list">
          <li><span>1</span>Tell us about yourself</li>
          <li><span>2</span>We match &amp; explain in plain language</li>
          <li><span>3</span>You get a ready-to-apply checklist</li>
        </ol>
      </div>
    </section>
  )
}

export default function Landing({ onStart }) {
  const reduceMotion = useReducedMotion()
  const revealProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1] } }

  return (
    <div className="landing-page" id="top">
      <BubbleMenu />
      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <MoltenMetal />
          <div className="hero-content">
            <motion.p className="eyebrow hero-eyebrow" {...revealProps}>A clearer path to support</motion.p>
            <motion.h1 id="hero-title" {...revealProps} transition={{ ...revealProps.transition, delay: 0.08 }}>
              <ParticleText>Find every scheme you qualify for.</ParticleText>
            </motion.h1>
            <motion.p className="hero-subtitle" {...revealProps} transition={{ ...revealProps.transition, delay: 0.15 }}>
              <ShinyText>A five-minute conversation, not a government form.</ShinyText>
            </motion.p>
            <motion.div className="hero-actions" {...revealProps} transition={{ ...revealProps.transition, delay: 0.22 }}>
              <SpecularButton onClick={onStart}>Find My Schemes</SpecularButton>
              <span className="hero-note">No sign-up. Just useful answers.</span>
            </motion.div>
            <p className="disclaimer">SchemeSetu helps you discover schemes — always confirm and apply on the official government portal.</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>Made for</span>
            <strong>students<br />in India</strong>
            <span className="stamp-star">✳</span>
          </div>
        </section>

        <section className="category-section" id="schemes" aria-labelledby="category-title">
          <div className="section-label-row">
            <p className="eyebrow" id="category-title">One place to start</p>
            <p className="section-aside">Central government education &amp; scholarship schemes</p>
          </div>
          <LogoLoop />
        </section>

        <section className="why-section" aria-labelledby="why-title">
          <div className="section-intro">
            <p className="eyebrow">Why SchemeSetu</p>
            <h2 id="why-title">Less searching.<br /><em>More certainty.</em></h2>
            <p>Government support should feel within reach. We turn scattered scheme details into a clear next step, shaped around you.</p>
          </div>
          <MagicBento />
        </section>

        <ScrollExpand />

        <section className="closing-section" id="language" aria-labelledby="closing-title">
          <div>
            <p className="eyebrow">Your language, your way</p>
            <h2 id="closing-title">Start with what<br /><em>you already know.</em></h2>
          </div>
          <div className="closing-action">
            <p>Explanations available in English, Tamil, Bengali and Malayalam.</p>
            <button className="text-link" type="button" onClick={onStart}>Begin your conversation <span aria-hidden="true">→</span></button>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="wordmark-mark" aria-hidden="true">S</span>SchemeSetu <span className="footer-year">— SIH 2026</span></div>
        <p>SchemeSetu helps you discover schemes — always confirm and apply on the official government portal.</p>
        <div className="footer-language" aria-label="Language options">
          <button type="button" className="language-active">EN</button>
          <button type="button">தமிழ்</button>
          <button type="button">বাংলা</button>
          <button type="button">മലയാളം</button>
        </div>
      </footer>
    </div>
  )
}
