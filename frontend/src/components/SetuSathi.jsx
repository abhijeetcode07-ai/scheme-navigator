import { useEffect, useMemo, useState } from 'react'
import { createChatThread, listChatMessages, listChatThreads, saveChatMessage } from '../lib/catalog'
import { supabaseConfigured } from '../lib/supabase'
import { getLanguage } from '../data/languages'
import './SetuSathi.css'

function toAssistantScheme(scheme) {
  return {
    id: scheme?.id || scheme?.slug,
    name: scheme?.displayName || scheme?.name,
    plainEligibility: scheme?.displayEligibility || scheme?.plainEligibility || scheme?.eligibility_plain,
    benefits: scheme?.displayBenefits || scheme?.benefits,
    documents: scheme?.displayDocuments || scheme?.documents || scheme?.documents_required,
    notesFlags: scheme?.notesFlags || scheme?.notes_flags,
  }
}

async function askSetuSathi({ language, answers, schemes, messages }) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'chat', language, answers, schemes: schemes.map(toAssistantScheme).filter((scheme) => scheme.id && scheme.name), messages }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'SetuSathi is unavailable right now.')
  return body.message?.content || ''
}

export default function SetuSathi({ language = 'English', user = null, answers = {}, schemes = [] }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [threadId, setThreadId] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const locale = getLanguage(language)
  const visibleSchemes = useMemo(() => schemes.slice(0, 8), [schemes])

  useEffect(() => {
    let active = true
    async function loadHistory() {
      if (!user) {
        setThreadId(null)
        setMessages([])
        return
      }
      try {
        const threads = await listChatThreads(user.id)
        const latest = threads[0]
        if (!active || !latest) return
        const history = await listChatMessages(user.id, latest.id)
        if (active) { setThreadId(latest.id); setMessages(history.map(({ role, content }) => ({ role, content }))) }
      } catch {
        if (active) setError('Saved history could not be loaded. You can still start a new chat.')
      }
    }
    loadHistory()
    return () => { active = false }
  }, [user])

  const sendMessage = async (event) => {
    event.preventDefault()
    const content = input.trim()
    if (!content || busy) return
    const nextUserMessage = { role: 'user', content }
    const nextMessages = [...messages, nextUserMessage]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setBusy(true)
    try {
      let activeThreadId = threadId
      if (user && !activeThreadId) {
        const thread = await createChatThread(user.id, locale.name)
        activeThreadId = thread.id
        setThreadId(activeThreadId)
      }
      if (user && activeThreadId) await saveChatMessage({ userId: user.id, threadId: activeThreadId, role: 'user', content })
      const reply = await askSetuSathi({ language: locale.name, answers, schemes: visibleSchemes, messages: nextMessages })
      const assistantMessage = { role: 'assistant', content: reply }
      setMessages((current) => [...current, assistantMessage])
      if (user && activeThreadId) await saveChatMessage({ userId: user.id, threadId: activeThreadId, role: 'assistant', content: reply })
    } catch (requestError) {
      setError(requestError.message)
      setMessages((current) => current.slice(0, -1))
    } finally {
      setBusy(false)
    }
  }

  return <>
    <button className="setu-fab" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="setusathi-panel"><span className="setu-fab-mark" aria-hidden="true">S</span><span>SetuSathi</span></button>
    {open && <section className="setu-panel" id="setusathi-panel" aria-label="SetuSathi chat assistant">
      <header className="setu-header"><div><p className="eyebrow">Your guide across the bridge</p><h2>SetuSathi</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close SetuSathi">×</button></header>
      <div className="setu-messages" aria-live="polite">
        {!messages.length && <div className="setu-welcome"><strong>Ask me anything about government support.</strong><p>I can help you understand your matches, documents, and the next official step.</p>{!user && <small>This chat is session-only until you sign in.</small>}</div>}
        {messages.map((message, index) => <div className={`setu-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'user' ? 'You' : 'SetuSathi'}</span><p>{message.content}</p></div>)}
        {busy && <div className="setu-message assistant"><span>SetuSathi</span><p className="setu-typing">Thinking through that…</p></div>}
      </div>
      {error && <p className="setu-error" role="status">{error}</p>}
      <form className="setu-form" onSubmit={sendMessage}><label className="sr-only" htmlFor="setu-message">Ask SetuSathi</label><input id="setu-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a scheme…" autoComplete="off" /><button type="submit" disabled={busy || !supabaseConfigured && false} aria-label="Send message">→</button></form>
    </section>}
  </>
}
