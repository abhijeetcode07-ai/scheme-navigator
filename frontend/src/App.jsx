import { useRef, useState } from 'react'
import Landing from './components/Landing'
import InputScreen from './components/InputScreen'
import ResultsScreen from './components/ResultsScreen'
import SchemeDetail from './components/SchemeDetail'
import DocumentChecklist from './components/DocumentChecklist'
import { matchSchemes } from './data/schemes'
import { getLanguage } from './data/languages'
import { requestDetailExplanation, requestMatchExplanations } from './lib/gemini'
import './App.css'

function mergeMatchExplanations(items, explanations = []) {
  const explanationById = new Map(explanations.map((item) => [item.id, item.reason]))
  return items.map((item) => explanationById.has(item.id) ? { ...item, reason: explanationById.get(item.id), aiReason: true } : item)
}

function fallbackStatus(error) {
  if (error?.code === 'missing_key') return { kind: 'fallback', message: 'Gemini is not configured yet — showing the verified scheme text.' }
  return { kind: 'fallback', message: 'Gemini is unavailable right now — showing the verified scheme text.' }
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [answers, setAnswers] = useState(null)
  const [matches, setMatches] = useState(null)
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [detailAi, setDetailAi] = useState(null)
  const [aiStatus, setAiStatus] = useState(null)
  const matchRequestRef = useRef(0)
  const detailRequestRef = useRef(0)

  const showInput = () => {
    matchRequestRef.current += 1
    setAiStatus(null)
    setScreen('input')
  }

  const showLanding = () => {
    matchRequestRef.current += 1
    detailRequestRef.current += 1
    setAiStatus(null)
    setScreen('landing')
  }

  const showResults = (submittedAnswers) => {
    const deterministicMatches = matchSchemes(submittedAnswers)
    const requestId = ++matchRequestRef.current
    const language = getLanguage(submittedAnswers.language)
    setAnswers(submittedAnswers)
    setMatches(deterministicMatches)
    setSelectedScheme(null)
    setDetailAi(null)
    setAiStatus(deterministicMatches.length ? { kind: 'loading', message: `Preparing a plain-language explanation in ${language.name}…` } : null)
    setScreen('results')

    if (!deterministicMatches.length) return

    requestMatchExplanations({ language: language.name, answers: submittedAnswers, schemes: deterministicMatches.slice(0, 12) })
      .then((data) => {
        if (requestId !== matchRequestRef.current) return
        const nextMatches = mergeMatchExplanations(deterministicMatches, data.explanations)
        setMatches(nextMatches)
        setAiStatus({ kind: 'ready', message: `Plain-language explanations prepared in ${language.name}. Eligibility remains based on the verified scheme records.` })
      })
      .catch((error) => {
        if (requestId !== matchRequestRef.current) return
        setAiStatus(fallbackStatus(error))
      })
  }

  const showDetail = (scheme) => {
    const requestId = ++detailRequestRef.current
    const language = getLanguage(answers?.language)
    setSelectedScheme(scheme)
    setDetailAi(null)
    setAiStatus({ kind: 'loading', message: `Preparing the detail in ${language.name}…` })
    setScreen('detail')

    requestDetailExplanation({ language: language.name, answers, scheme })
      .then((data) => {
        if (requestId !== detailRequestRef.current) return
        setDetailAi(data.detail)
        setAiStatus({ kind: 'ready', message: `Detail explanation prepared in ${language.name}.` })
      })
      .catch((error) => {
        if (requestId !== detailRequestRef.current) return
        setAiStatus(fallbackStatus(error))
      })
  }

  const showChecklist = () => {
    detailRequestRef.current += 1
    setScreen('checklist')
  }

  if (screen === 'checklist' && selectedScheme) {
    return <DocumentChecklist scheme={selectedScheme} onBack={() => setScreen('detail')} />
  }

  if (screen === 'detail' && selectedScheme) {
    return <SchemeDetail scheme={selectedScheme} aiDetail={detailAi} aiStatus={aiStatus} onBack={() => setScreen('results')} onChecklist={showChecklist} />
  }

  if (screen === 'results') {
    return <ResultsScreen answers={answers} matches={matches} aiStatus={aiStatus} onEdit={showInput} onItemSelect={showDetail} />
  }

  if (screen === 'input') {
    return <InputScreen onSubmit={showResults} onBack={showLanding} />
  }

  return <Landing onStart={showInput} />
}

export default App
