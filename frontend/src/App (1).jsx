import { useState } from 'react'
import Landing from './components/Landing'
import InputScreen from './components/InputScreen'
import ResultsScreen from './components/ResultsScreen'
import SchemeDetail from './components/SchemeDetail'
import DocumentChecklist from './components/DocumentChecklist'
import './App.css'

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
  const showChecklist = () => setScreen('checklist')

  if (screen === 'checklist' && selectedScheme) {
    return <DocumentChecklist scheme={selectedScheme} onBack={() => setScreen('detail')} />
  }

  if (screen === 'detail' && selectedScheme) {
    return <SchemeDetail scheme={selectedScheme} onBack={() => setScreen('results')} onChecklist={showChecklist} />
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
