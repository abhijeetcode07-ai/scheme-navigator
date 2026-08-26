import { useReducedMotion } from 'motion/react'
import './DocumentChecklist.css'

export default function DocumentChecklist({ scheme, onBack, onHome }) {
  const reduceMotion = useReducedMotion()
  const documents = scheme.documents?.length ? scheme.documents : ['Check the current official notification for the required documents.']

  return (
    <main className={`checklist-page ${reduceMotion ? 'reduce-motion' : ''}`}>
      <header className="checklist-header">
        <button className="checklist-back" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to scheme</button>
        <span className="checklist-step">STEP 04 <span aria-hidden="true">/</span> DOCUMENT CHECKLIST</span>
      </header>
      <section className="checklist-content" aria-labelledby="checklist-title">
        <p className="eyebrow">Get ready to apply</p>
        <h1 id="checklist-title">Bring these<br /><em>with you.</em></h1>
        <p className="checklist-lede">A practical starting list for {scheme.name}. Confirm the latest requirements on the official portal before submitting anything.</p>
        <ol className="checklist-list">
          {documents.map((document, index) => <li key={document}><span className="checklist-number">{String(index + 1).padStart(2, '0')}</span><span>{document}</span></li>)}
        </ol>
        <div className="checklist-actions">
          <button className="checklist-home" type="button" onClick={onHome}>Return home</button>
          <p>Always confirm current eligibility and deadlines on the official portal before applying.</p>
        </div>
      </section>
    </main>
  )
}
