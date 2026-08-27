import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './Landing.css'
import { getCopy, getLanguage, languages } from '../data/languages'
import MoltenMetal from './MoltenMetal'
import LatestFeed from './LatestFeed'

function BubbleMenu({ copy, accountPanel }) {
  const [open, setOpen] = useState(false)
  const items = [[copy.nav.home, '#top'], [copy.nav.howItWorks, '#how-it-works'], [copy.nav.schemes, '#schemes'], [copy.nav.language, '#language']]
  return <header className="site-nav" aria-label={copy.nav.home}>
    <a className="wordmark" href="#top" aria-label={`${copy.nav.home} — SchemeSetu`}><span className="wordmark-mark" aria-hidden="true">S</span>SchemeSetu</a>
    <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-menu" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setOpen((current) => !current)}><span /><span /></button>
    <nav id="main-menu" className={`bubble-menu ${open ? 'is-open' : ''}`}>{items.map(([label, href], index) => <a key={label} className={`bubble-link bubble-link-${index + 1}`} href={href} onClick={() => setOpen(false)}>{label}</a>)}{accountPanel}</nav>
  </header>
}

function ParticleText({ children }) {
  const words = children.split(' ')
  return <span className="particle-text" aria-label={children}>{words.map((word, index) => <span className={index === 2 || index === 4 ? 'particle-word highlight-word' : 'particle-word'} key={`${word}-${index}`}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}</span>
}

function ShinyText({ children }) { return <span className="shiny-text">{children}</span> }
function SpecularButton({ children, onClick }) { return <button className="specular-button" type="button" onClick={onClick}><span>{children}</span><span className="button-arrow" aria-hidden="true">↗</span></button> }

function LogoLoop({ labels }) {
  return <div className="logo-loop" aria-label="Scheme categories we cover"><div className="logo-loop-track">{[...labels, ...labels].map((label, index) => <span className="category-chip" key={`${label}-${index}`}><span className="chip-dot" aria-hidden="true" />{label}</span>)}</div></div>
}

function MagicBento({ features }) {
  return <div className="feature-grid">{features.map(([title, description], index) => <article className="feature-card" key={`${title}-${index}`}><div className="feature-card-top"><span className="feature-number">0{index + 1}</span><span className="feature-spark" aria-hidden="true">✦</span></div><h3>{title}</h3><p>{description}</p></article>)}</div>
}

function ScrollExpand({ copy }) {
  return <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="how-copy"><p className="eyebrow">{copy.simpleFlow}</p><h2 id="how-title">{copy.simpleFlow}</h2><p className="scroll-hint">{copy.scrollFlow} <span aria-hidden="true">↓</span></p></div><div className="flow-card"><div className="flow-art" aria-hidden="true"><div className="flow-sun" /><div className="flow-line flow-line-a" /><div className="flow-line flow-line-b" /><div className="flow-line flow-line-c" /></div><ol className="flow-list">{copy.flow.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></div></section>
}

export default function Landing({ onStart, language = 'English', onLanguageChange, accountPanel }) {
  const reduceMotion = useReducedMotion()
  const copy = getCopy(language)
  const landing = copy.landing
  const revealProps = reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1] } }
  return <div className="landing-page" id="top">
    <BubbleMenu copy={copy} accountPanel={accountPanel} />
    <main>
      <section className="hero-section" aria-labelledby="hero-title"><MoltenMetal color1="#16233F" color2="#E8A33D" color3="#FBF7EF" speed={reduceMotion ? 0 : 0.22} scale={4} detail={3} glow={1.35} coreSize={0.1} swirl={1} fold={-0.2} blackPoint={0.05} brightness={1.18} colorMode="molten" grain={!reduceMotion} grainIntensity={0.035} mouseInteraction={!reduceMotion} mouseStrength={0.22} opacity={0.62} /><div className="hero-content"><motion.p className="eyebrow hero-eyebrow" {...revealProps}>{landing.eyebrow}</motion.p><motion.h1 id="hero-title" {...revealProps} transition={{ ...revealProps.transition, delay: 0.08 }}><ParticleText>{landing.title}</ParticleText></motion.h1><motion.p className="hero-subtitle" {...revealProps} transition={{ ...revealProps.transition, delay: 0.15 }}><ShinyText>{landing.subtitle}</ShinyText></motion.p><motion.div className="hero-actions" {...revealProps} transition={{ ...revealProps.transition, delay: 0.22 }}><SpecularButton onClick={onStart}>{landing.start}</SpecularButton><span className="hero-note">{landing.note}</span></motion.div><p className="disclaimer">{landing.disclaimer}</p></div><div className="hero-stamp" aria-hidden="true"><span>{landing.madeFor}</span><strong>{landing.students}<br />{landing.inIndia}</strong><span className="stamp-star">✳</span></div></section>
      <section className="category-section" id="schemes" aria-labelledby="category-title"><div className="section-label-row"><p className="eyebrow" id="category-title">{landing.onePlace}</p><p className="section-aside">{landing.coverage}</p></div><LogoLoop labels={landing.categories} /></section>
      <LatestFeed language={language} />
      <section className="why-section" aria-labelledby="why-title"><div className="section-intro"><p className="eyebrow">{landing.why}</p><h2 id="why-title">{landing.lessSearching}<br /><em>{landing.moreCertainty}</em></h2><p>{landing.whyBody}</p></div><MagicBento features={landing.features} /></section>
      <ScrollExpand copy={landing} />
      <section className="closing-section" id="language" aria-labelledby="closing-title"><div><p className="eyebrow">{landing.languageEyebrow}</p><h2 id="closing-title">{landing.languageTitle}<br /><em>{landing.languageTitleEm}</em></h2></div><div className="closing-action"><p>{landing.languageBody}</p><div className="landing-language-picker" aria-label={landing.footerLanguage}>{languages.map((item) => <button key={item.name} type="button" className={getLanguage(language).name === item.name ? 'language-active' : ''} aria-pressed={getLanguage(language).name === item.name} onClick={() => onLanguageChange?.(item.name)}>{item.nativeName}</button>)}</div><button className="text-link" type="button" onClick={onStart}>{landing.begin} <span aria-hidden="true">→</span></button></div></section>
    </main>
    <footer className="site-footer"><div className="footer-brand"><span className="wordmark-mark" aria-hidden="true">S</span>SchemeSetu <span className="footer-year">— {landing.sih}</span></div><p>{landing.footerNote}</p><div className="footer-language" aria-label={landing.footerLanguage}>{languages.map((item) => <button key={item.name} type="button" className={getLanguage(language).name === item.name ? 'language-active' : ''} aria-pressed={getLanguage(language).name === item.name} onClick={() => onLanguageChange?.(item.name)}>{item.nativeName}</button>)}</div></footer>
  </div>
}
