import { useState } from 'react'
import Landing from './components/Landing'
import './App.css'

function InputScreen({ onBack }) {
  return (
    <main className="input-screen">
      <button className="back-link" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to SchemeSetu
      </button>
      <div className="input-card">
        <p className="eyebrow">Let’s find your fit</p>
        <h1>Tell us a little<br /><em>about yourself.</em></h1>
        <p className="input-lede">This is a placeholder handoff for Page 2. The conversation form can plug in here next.</p>
        <button className="specular-button" type="button" onClick={onBack}>Return home <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </main>
  )
}

function App() {
  const [screen, setScreen] = useState('landing')

  return screen === 'landing' ? (
    <Landing onStart={() => setScreen('input')} />
  ) : (
    <InputScreen onBack={() => setScreen('landing')} />
  )
}

export default App
