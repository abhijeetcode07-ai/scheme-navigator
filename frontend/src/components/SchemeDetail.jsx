import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './SchemeDetail.css'
import { getCopy, getDetailFallback, interpolate } from '../data/languages'

function MaskedHeading({ text, tag = 'h1', mediaType = 'image', src = '/assets/paper-texture.jpg', fillScale = 1.2, parallax = 20, grayscale = true, reveal = 'wipe', trigger = 'view', align = 'left', weight = 700 }) {
  const headingRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const Heading = tag

  useEffect(() => {
    const heading = headingRef.current
    if (!heading || reduceMotion || !parallax) return undefined

    let frame
    const update = () => {
      frame = undefined
      const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - heading.getBoundingClientRect().top) / window.innerHeight))
      heading.style.setProperty('--heading-parallax', `${progress * parallax}px`)
    }
    const handleScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [parallax, reduceMotion])

  return <Heading ref={headingRef} className={`masked-heading masked-heading-${reveal}`} data-media-type={mediaType} data-trigger={trigger} style={{ '--heading-image': `url(${src})`, '--heading-fill-scale': fillScale, '--heading-align': align, '--heading-weight': weight, filter: grayscale ? 'grayscale(1)' : undefined }}>{text}</Heading>
}

function GlareHover({ children, glareColor = '#E8A33D', glareOpacity = 0.2, glareAngle = -30, transitionDuration = 500 }) {
  return <div className="detail-glare-hover" style={{ '--glare-color': glareColor, '--glare-opacity': glareOpacity, '--glare-angle': `${glareAngle}deg`, '--glare-duration': `${transitionDuration}ms` }}>{children}</div>
}

function SpecularButton({ children, variant = 'primary', disabled = false, onClick }) {
  return <button className={`detail-specular-button detail-specular-${variant}`} type="button" disabled={disabled} onClick={onClick}><span>{children}</span><span className="detail-button-arrow" aria-hidden="true">↗</span></button>
}

function DetailCard({ label, title, children, action }) {
  return <GlareHover><section className="detail-content-card"><p className="detail-card-label">{label}</p><h2>{title}</h2><div className="detail-card-body">{children}</div>{action}</section></GlareHover>
}

function isRealLink(link) { return typeof link === 'string' && /^https?:\/\//i.test(link.trim()) }

export default function SchemeDetail({ scheme, aiDetail, aiStatus, onBack, onChecklist, language }) {
  const reduceMotion = useReducedMotion()
  const copy = getCopy(language).detail
  const fallback = getDetailFallback(language)
  if (!scheme) return null
  const canApply = isRealLink(scheme.officialApplyLink)
  const displayName = aiDetail?.name || scheme.displayName || scheme.name
  const displayMinistry = aiDetail?.ministry || scheme.ministry
  const documents = aiDetail?.documents?.length ? aiDetail.documents : language === 'English' && scheme.documents?.length ? scheme.documents : [fallback.document]

  const applyOfficial = () => {
    if (canApply) window.open(scheme.officialApplyLink.trim(), '_blank', 'noopener,noreferrer')
  }

  return <main className="scheme-detail-page">
    <header className="detail-header">
      <button className="detail-back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> {copy.back}</button>
      <span className="detail-step">{copy.step}</span>
    </header>
    <motion.div className="detail-layout" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [0.23, 1, 0.32, 1] }}>
      <div className="detail-intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <MaskedHeading text={displayName} tag="h1" mediaType="image" src="/assets/paper-texture.jpg" fillScale={1.2} parallax={20} grayscale reveal="wipe" trigger="view" align="left" weight={700} />
        <p className="detail-ministry">{displayMinistry}</p>
        <p className="detail-verification">{interpolate(copy.verified, { date: scheme.lastVerifiedDate })}</p>
        {aiStatus && <p className={`detail-ai-status detail-ai-status-${aiStatus.kind}`} role="status" aria-live="polite">{aiStatus.message}</p>}
      </div>
      <div className="detail-sections">
        <DetailCard label={copy.yourFit} title={copy.why}><p>{aiDetail?.why || fallback.why}</p></DetailCard>
        <DetailCard label={copy.theSupport} title={copy.support}><p>{aiDetail?.support || fallback.support}</p></DetailCard>
        <DetailCard label={copy.getReady} title={copy.before} action={<button className="checklist-inline-link" type="button" onClick={onChecklist}>{copy.checklistInline} <span aria-hidden="true">→</span></button>}>
          <p className="detail-before-apply">{aiDetail?.beforeApply || fallback.before}</p>
          <ul className="document-list">{documents.slice(0, 4).map((document) => <li key={document}>{document}</li>)}</ul>
        </DetailCard>
        <div className="detail-actions"><SpecularButton onClick={onChecklist}>{copy.checklist}</SpecularButton><SpecularButton variant="secondary" disabled={!canApply} onClick={applyOfficial}>{copy.official}</SpecularButton></div>
        {!canApply && <p className="detail-link-note">{copy.linkNote}</p>}
      </div>
    </motion.div>
    <footer className="detail-footer">{copy.footer}</footer>
  </main>
}
