import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './SchemeDetail.css'

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
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [parallax, reduceMotion])

  return (
    <Heading
      ref={headingRef}
      className={`masked-heading masked-heading-${reveal}`}
      data-media-type={mediaType}
      data-trigger={trigger}
      style={{
        '--heading-image': `url(${src})`,
        '--heading-fill-scale': fillScale,
        '--heading-align': align,
        '--heading-weight': weight,
        filter: grayscale ? 'grayscale(1)' : undefined,
      }}
    >
      {text}
    </Heading>
  )
}

function GlareHover({ children, glareColor = '#E8A33D', glareOpacity = 0.2, glareAngle = -30, transitionDuration = 500 }) {
  return (
    <div
      className="detail-glare-hover"
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

function SpecularButton({ children, variant = 'primary', disabled = false, onClick }) {
  return (
    <button className={`detail-specular-button detail-specular-${variant}`} type="button" disabled={disabled} onClick={onClick}>
      <span>{children}</span>
      <span className="detail-button-arrow" aria-hidden="true">↗</span>
    </button>
  )
}

function DetailCard({ label, title, children, action }) {
  return (
    <GlareHover>
      <section className="detail-content-card">
        <p className="detail-card-label">{label}</p>
        <h2>{title}</h2>
        <div className="detail-card-body">{children}</div>
        {action}
      </section>
    </GlareHover>
  )
}

function isRealLink(link) {
  return typeof link === 'string' && /^https?:\/\//i.test(link.trim())
}

export default function SchemeDetail({ scheme, aiDetail, aiStatus, onBack, onChecklist }) {
  const reduceMotion = useReducedMotion()
  if (!scheme) return null
  const canApply = isRealLink(scheme.officialApplyLink)

  const applyOfficial = () => {
    if (canApply) window.open(scheme.officialApplyLink.trim(), '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="scheme-detail-page">
      <header className="detail-header">
        <button className="detail-back-link" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to matches
        </button>
        <span className="detail-step">STEP 03 <span aria-hidden="true">/</span> SCHEME DETAIL</span>
      </header>
      <motion.div className="detail-layout" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [0.23, 1, 0.32, 1] }}>
        <div className="detail-intro">
          <p className="eyebrow">Plain-language breakdown</p>
          <MaskedHeading text={scheme.name} tag="h1" mediaType="image" src="/assets/paper-texture.jpg" fillScale={1.2} parallax={20} grayscale reveal="wipe" trigger="view" align="left" weight={700} />
          <p className="detail-ministry">{scheme.ministry}</p>
          <p className="detail-verification">Last verified {scheme.lastVerifiedDate}. Always confirm current eligibility and deadlines on the official portal before applying.</p>
          {aiStatus && <p className={`detail-ai-status detail-ai-status-${aiStatus.kind}`} role="status" aria-live="polite">{aiStatus.message}</p>}
        </div>
        <div className="detail-sections">
          <DetailCard label="01 / Your fit" title="Why you qualify">
            <p>{aiDetail?.why || scheme.plainEligibility || scheme.officialEligibility}</p>
          </DetailCard>
          <DetailCard label="02 / The support" title="What you get">
            <p>{aiDetail?.support || scheme.benefits || 'Benefit details are listed in the current official scheme guidance.'}</p>
          </DetailCard>
          <DetailCard
            label="03 / Get ready"
            title="Before you apply"
            action={<button className="checklist-inline-link" type="button" onClick={onChecklist}>Open the full document checklist <span aria-hidden="true">→</span></button>}
          >
            <p className="detail-before-apply">{aiDetail?.beforeApply || 'Use this list as a starting point and confirm the current portal requirements.'}</p>
            <ul className="document-list">
              {(scheme.documents?.length ? scheme.documents.slice(0, 4) : ['Check the current official notice for required documents.']).map((document) => <li key={document}>{document}</li>)}
            </ul>
          </DetailCard>
          <div className="detail-actions">
            <SpecularButton onClick={onChecklist}>View Document Checklist</SpecularButton>
            <SpecularButton variant="secondary" disabled={!canApply} onClick={applyOfficial}>Apply on Official Site</SpecularButton>
          </div>
          {!canApply && <p className="detail-link-note">The dataset flags this scheme’s application link for current-cycle verification, so the official-site button is held until a live link is confirmed.</p>}
        </div>
      </motion.div>
      <footer className="detail-footer">Always confirm current eligibility and deadlines on the official portal before applying.</footer>
    </main>
  )
}
