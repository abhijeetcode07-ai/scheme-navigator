import { useEffect, useRef } from 'react'

export function BlackHole() {
  return <div className="vs-black-hole" aria-hidden="true"><span className="vs-black-hole-core" /><span className="vs-black-hole-ring vs-black-hole-ring-one" /><span className="vs-black-hole-ring vs-black-hole-ring-two" /><span className="vs-black-hole-starfield" /></div>
}

export function Globe({ label = 'INDIA' }) {
  return <div className="vs-globe" aria-hidden="true"><span className="vs-globe-lat vs-globe-lat-one" /><span className="vs-globe-lat vs-globe-lat-two" /><span className="vs-globe-lon vs-globe-lon-one" /><span className="vs-globe-lon vs-globe-lon-two" /><span className="vs-globe-label">{label}</span></div>
}

export function MagicRings() {
  return <div className="vs-magic-rings" aria-hidden="true"><span /><span /><span /><span /></div>
}

export function SplitFlapText({ children, as: Tag = 'span', className = '' }) {
  return <Tag className={`vs-split-flap ${className}`} data-text={children}>{children}</Tag>
}

export function MagicBento({ children, className = '' }) {
  return <div className={`vs-magic-bento ${className}`}>{children}</div>
}

export function BorderGlow({ children, className = '' }) {
  return <div className={`vs-border-glow ${className}`}>{children}</div>
}

export function Topography() {
  return <div className="vs-topography" aria-hidden="true"><span className="vs-topography-line vs-topography-line-one" /><span className="vs-topography-line vs-topography-line-two" /><span className="vs-topography-line vs-topography-line-three" /></div>
}

export function AnimatedList({ children, className = '' }) {
  return <div className={`vs-animated-list ${className}`}>{children}</div>
}

export function ScrollStack({ children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const onScroll = () => {
      const cards = node.querySelectorAll('[data-stack-card]')
      cards.forEach((card, index) => {
        const distance = Math.min(Math.max(node.scrollTop - index * 18, 0), 110)
        card.style.setProperty('--stack-shift', `${distance * -0.08}px`)
        card.style.setProperty('--stack-scale', `${1 - distance * 0.0007}`)
      })
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => node.removeEventListener('scroll', onScroll)
  }, [])
  return <div ref={ref} className={`vs-scroll-stack ${className}`}>{children}</div>
}

export function LaserFlow() {
  return <div className="vs-laser-flow" aria-hidden="true"><span /><span /></div>
}

export function StrokeText({ children, as: Tag = 'span', className = '' }) {
  return <Tag className={`vs-stroke-text ${className}`}>{children}</Tag>
}

export function CurvedLoop({ children }) {
  return <div className="vs-curved-loop" aria-hidden="true"><div>{children}<span>{children}</span></div></div>
}

export function ShapeGrid() {
  return <div className="vs-shape-grid" aria-hidden="true"><span className="vs-shape-grid-cross vs-shape-grid-cross-one" /><span className="vs-shape-grid-cross vs-shape-grid-cross-two" /><span className="vs-shape-grid-scan" /></div>
}

export function Stepper({ steps, current = 1 }) {
  return <div className="vs-stepper" aria-label="Scheme detail stages">{steps.map((step, index) => <div className={`vs-stepper-item ${index + 1 <= current ? 'is-active' : ''}`} key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b></div>)}</div>
}
