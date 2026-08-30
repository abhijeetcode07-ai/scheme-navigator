import { useEffect, useState } from 'react'
import { signInWithEmail, signInWithGoogle, signOut, signUpWithEmail, supabase, supabaseConfigured } from '../lib/supabase'
import './AuthPanel.css'
import './VisualStack.css'
import { BorderGlow, SplitFlapText } from './VisualStack'

export default function AuthPanel({ user, onAuthChange }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!supabase) return undefined
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      onAuthChange?.(session?.user || null)
      if (session?.user) setOpen(false)
    })
    return () => data.subscription.unsubscribe()
  }, [onAuthChange])

  const submitEmail = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const result = mode === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password)
      if (result.error) throw result.error
      if (mode === 'signup') setMessage('Check your email to confirm your account before signing in.')
      else setOpen(false)
    } catch (error) {
      setMessage(error?.message || 'We could not complete that request. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setBusy(true)
    setMessage('')
    try {
      const result = await signInWithGoogle()
      if (result.error) throw result.error
    } catch (error) {
      setMessage(error?.message || 'Google sign-in is unavailable right now.')
      setBusy(false)
    }
  }

  if (user) {
    return <div className="account-chip"><span className="account-avatar" aria-hidden="true">{(user.user_metadata?.full_name || user.email || 'S').slice(0, 1).toUpperCase()}</span><span className="account-email">{user.email}</span><button type="button" className="account-action" onClick={() => signOut()} aria-label="Sign out">Sign out</button></div>
  }

  return <>
    <button type="button" className="account-trigger" onClick={() => { setMessage(''); setOpen(true) }}>Sign in</button>
    {open && <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <BorderGlow className="auth-panel-glow"><section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="auth-close" onClick={() => setOpen(false)} aria-label="Close sign-in dialog">×</button>
        <p className="eyebrow">Keep your path in one place</p>
        <SplitFlapText as="h2" id="auth-title" className="auth-title">{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</SplitFlapText>
        <p className="auth-copy">Save conversations and return to your scheme history whenever you need it.</p>
        {!supabaseConfigured && <p className="auth-notice">Account sign-in is being configured. Add the Supabase public variables to use it.</p>}
        <button type="button" className="google-button" onClick={handleGoogle} disabled={busy || !supabaseConfigured}><span aria-hidden="true">G</span>{busy ? 'Connecting…' : 'Continue with Google'}</button>
        <div className="auth-divider"><span>or use email</span></div>
        <form onSubmit={submitEmail}>
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          <button type="submit" className="auth-submit" disabled={busy || !supabaseConfigured}>{mode === 'signin' ? 'Sign in with email' : 'Create account'}</button>
        </form>
        {message && <p className="auth-message" role="status">{message}</p>}
        <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
      </section></BorderGlow>
    </div>}
  </>
}
