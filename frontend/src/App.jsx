import { useState } from 'react'
import Landing from './components/Landing'
import InputScreen from './components/InputScreen'
import ResultsScreen from './components/ResultsScreen'
import './App.css'

function SchemeDetailScreen({ scheme, onBack, onHome }) {
  return (
    <main className="detail-screen">
      <div className="detail-card">
        <button className="detail-back" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to matches</button>
        <p className="eyebrow">Scheme detail</p>
        <h1>{scheme.name}</h1>
        <p className="detail-reason">{scheme.reason}</p>
        <div className="detail-placeholder">
          <span aria-hidden="true">✦</span>
          <p>Eligibility details, document checklist, and official application link will appear here next.</p>
        </div>
        <button className="detail-home" type="button" onClick={onHome}>Return home</button>
      </div>
    </main>
  )
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [answers, setAnswers] = useState(null)
  const [selectedScheme, setSelectedScheme] = useState(null)

  const showInput = () => setScreen('input')
  const showLanding = () => setScreen('landing')
  const showResults = (submittedAnswers) => {
    setAnswers(submittedAnswers)
    setSelectedScheme(null)
    setScreen('results')
  }
  const showDetail = (scheme) => {
    setSelectedScheme(scheme)
    setScreen('detail')
  }

  if (screen === 'detail' && selectedScheme) {
    return <SchemeDetailScreen scheme={selectedScheme} onBack={() => setScreen('results')} onHome={showLanding} />
  }

  if (screen === 'results') {
    return <ResultsScreen answers={answers} onEdit={showInput} onItemSelect={showDetail} />
  }

  if (screen === 'input') {
    return <InputScreen onSubmit={showResults} onBack={showLanding} />
  }

  return <Landing onStart={showInput} />
}

export default App
