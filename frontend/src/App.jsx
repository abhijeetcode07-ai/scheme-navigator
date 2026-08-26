import { useState } from 'react'
import Landing from './components/Landing'
import InputScreen, { ResultsScreen } from './components/InputScreen'
import './App.css'

function App() {
  const [screen, setScreen] = useState('landing')
  const [answers, setAnswers] = useState(null)

  const showInput = () => setScreen('input')
  const showLanding = () => setScreen('landing')
  const showResults = (submittedAnswers) => {
    setAnswers(submittedAnswers)
    setScreen('results')
  }

  if (screen === 'results' && answers) {
    return <ResultsScreen answers={answers} onBack={showInput} onHome={showLanding} />
  }

  if (screen === 'input') {
    return <InputScreen onSubmit={showResults} onBack={showLanding} />
  }

  return <Landing onStart={showInput} />
}

export default App
