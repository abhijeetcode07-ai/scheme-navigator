import { useCallback, useEffect, useRef, useState } from 'react'
import Landing from './components/Landing'
import InputScreen from './components/InputScreen'
import ResultsScreen from './components/ResultsScreen'
import SchemeDetail from './components/SchemeDetail'
import DocumentChecklist from './components/DocumentChecklist'
import { matchSchemes } from './data/schemes'
import { getCopy, getLanguage, interpolate } from './data/languages'
import { requestDetailExplanation, requestMatchExplanations } from './lib/gemini'
import './App.css'
import AuthPanel from './components/AuthPanel'
import SetuSathi from './components/SetuSathi'
import BrowseSchemes from './components/BrowseSchemes'
import LatestUpdates from './components/LatestUpdates'
import ProfileDetails from './components/ProfileDetails'
import { supabase } from './lib/supabase'
import { fetchPublishedSchemes } from './lib/catalog'

function mergeMatchExplanations(items, explanations = []) {
  const explanationById = new Map(explanations.map((item) => [item.id, item]))
  return items.map((item) => explanationById.has(item.id) ? { ...item, name: explanationById.get(item.id).name || item.name, reason: explanationById.get(item.id).reason, aiReason: true } : item)
}

function languageStatus(kind, language, mode = 'results') {
  const copy = getCopy(language)[mode === 'detail' ? 'detail' : 'results']
  const languageName = getLanguage(language).nativeName
  if (kind === 'loading') return { kind, message: interpolate(copy.aiPreparing, { language: languageName }) }
  if (kind === 'ready') return { kind, message: mode === 'detail' ? interpolate(copy.aiReady, { language: languageName }) : interpolate(copy.aiReady, { language: languageName }) }
  if (kind === 'missing') return { kind: 'fallback', message: copy.aiMissing }
  return { kind: 'fallback', message: copy.aiUnavailable }
}

function App() {
  const [screen, setScreen] = useState('landing')
  const [language, setLanguage] = useState('English')
  const [answers, setAnswers] = useState(null)
  const [matches, setMatches] = useState(null)
  const [catalogSchemes, setCatalogSchemes] = useState([])
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [detailAi, setDetailAi] = useState(null)
  const [aiStatus, setAiStatus] = useState(null)
  const [user, setUser] = useState(null)
  const matchRequestRef = useRef(0)
  const detailRequestRef = useRef(0)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => data.subscription.unsubscribe()
  }, [])

  const updateLanguage = (nextLanguage) => setLanguage(getLanguage(nextLanguage).name)
  const renderAccountPanel = useCallback(() => <AuthPanel user={user} onAuthChange={setUser} />, [user])
  const renderSetuSathi = useCallback(() => <SetuSathi language={language} user={user} answers={answers || {}} schemes={catalogSchemes.length ? catalogSchemes : (matches || [])} />, [language, user, answers, matches, catalogSchemes])

  useEffect(() => {
    let active = true
    fetchPublishedSchemes({ languageCode: getLanguage(language).name, page: 0, pageSize: 100 })
      .then((payload) => {
        if (active) setCatalogSchemes(Array.isArray(payload?.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setCatalogSchemes([])
      })
    return () => { active = false }
  }, [language])

  const showProfile = (draftAnswers) => {
    setAnswers(draftAnswers)
    setScreen('profile')
  }

  const showBrowse = () => {
    detailRequestRef.current += 1
    setScreen('browse')
  }

  const showLatest = () => {
    detailRequestRef.current += 1
    setScreen('updates')
  }

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
    const selectedLanguage = getLanguage(submittedAnswers.language).name
    setLanguage(selectedLanguage)
    setAnswers(submittedAnswers)
    setMatches(deterministicMatches)
    setSelectedScheme(null)
    setDetailAi(null)
    setAiStatus(deterministicMatches.length ? languageStatus('loading', selectedLanguage) : null)
    setScreen('results')

    if (!deterministicMatches.length) return

    requestMatchExplanations({ language: selectedLanguage, answers: submittedAnswers, schemes: deterministicMatches.slice(0, 12) })
      .then((data) => {
        if (requestId !== matchRequestRef.current) return
        setMatches(mergeMatchExplanations(deterministicMatches, data.explanations))
        setAiStatus(languageStatus('ready', selectedLanguage))
      })
      .catch((error) => {
        if (requestId !== matchRequestRef.current) return
        setAiStatus(languageStatus(error?.code === 'missing_key' ? 'missing' : 'unavailable', selectedLanguage))
      })
  }

  const showDetail = (scheme) => {
    const requestId = ++detailRequestRef.current
    const selectedLanguage = getLanguage(answers?.language || language).name
    setSelectedScheme(scheme)
    setDetailAi(null)
    setAiStatus(languageStatus('loading', selectedLanguage, 'detail'))
    setScreen('detail')

    requestDetailExplanation({ language: selectedLanguage, answers, scheme })
      .then((data) => {
        if (requestId !== detailRequestRef.current) return
        setDetailAi(data.detail)
        setAiStatus(languageStatus('ready', selectedLanguage, 'detail'))
      })
      .catch((error) => {
        if (requestId !== detailRequestRef.current) return
        setAiStatus(languageStatus(error?.code === 'missing_key' ? 'missing' : 'unavailable', selectedLanguage, 'detail'))
      })
  }

  const showChecklist = () => {
    detailRequestRef.current += 1
    setScreen('checklist')
  }

  let content = null
  if (screen === 'updates') content = <LatestUpdates language={language} onBack={showLanding} />
  else if (screen === 'profile') content = <ProfileDetails initialAnswers={answers || {}} onBack={showInput} onSubmit={showResults} />
  else if (screen === 'browse') content = <BrowseSchemes language={language} onBack={showLanding} onSelect={showDetail} />
  else if (screen === 'checklist' && selectedScheme) content = <DocumentChecklist scheme={selectedScheme} localizedDocuments={detailAi?.documents} language={language} onBack={() => setScreen('detail')} />
  else if (screen === 'detail' && selectedScheme) content = <SchemeDetail scheme={selectedScheme} language={language} aiDetail={detailAi} aiStatus={aiStatus} onBack={() => setScreen('results')} onChecklist={showChecklist} />
  else if (screen === 'results') content = <ResultsScreen answers={answers} matches={matches} aiStatus={aiStatus} onEdit={showInput} onItemSelect={showDetail} />
  else if (screen === 'input') content = <InputScreen initialLanguage={language} onLanguageChange={updateLanguage} onSubmit={showProfile} onBack={showLanding} />
  else content = <Landing language={language} onLanguageChange={updateLanguage} onStart={showInput} onBrowse={showBrowse} onLatest={showLatest} accountPanel={renderAccountPanel()} />

  return <div className="app-shell theme-dark">
    {content}
    {renderSetuSathi()}
  </div>
}

export default App
