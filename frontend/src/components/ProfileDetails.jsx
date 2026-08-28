import { useState } from 'react'
import './ProfileDetails.css'

const fields = {
  age: ['Under 18', '18–25', '26–40', '41–60', 'Above 60'],
  gender: ['Woman', 'Man', 'Transgender', 'Prefer not to say'],
  residence: ['Rural area', 'Urban area', 'Prefer not to say'],
  disability: ['Yes', 'No', 'Prefer not to say'],
}

function Choice({ label, name, value, options, onChange }) {
  return <fieldset className="profile-choice"><legend>{label}</legend><div className="profile-choice-list">{options.map((option) => <button type="button" key={option} className={value === option ? 'is-selected' : ''} aria-pressed={value === option} onClick={() => onChange(name, option)}>{option}</button>)}</div></fieldset>
}

export default function ProfileDetails({ initialAnswers = {}, onBack, onSubmit }) {
  const [details, setDetails] = useState({ age: initialAnswers.age || '', gender: initialAnswers.gender || '', state: initialAnswers.state || '', residence: initialAnswers.residence || '', disability: initialAnswers.disability || '' })
  const update = (name, value) => setDetails((current) => ({ ...current, [name]: value }))
  const ready = Boolean(details.age && details.gender && details.state && details.residence && details.disability)
  return <main className="profile-page"><header className="profile-header"><button type="button" className="back-link" onClick={onBack}><span aria-hidden="true">←</span> Back to your answers</button><p className="eyebrow">STEP 02 / YOUR CONTEXT</p><h1>A little more context.</h1><p>These details help separate broad public benefits from support meant for a particular stage of life or situation.</p></header><form className="profile-panel" onSubmit={(event) => { event.preventDefault(); if (ready) onSubmit({ ...initialAnswers, ...details }) }}><Choice label="Your age group" name="age" value={details.age} options={fields.age} onChange={update} /><Choice label="Gender identity" name="gender" value={details.gender} options={fields.gender} onChange={update} /><label className="profile-text-field" htmlFor="profile-state">State or Union Territory<select id="profile-state" value={details.state} onChange={(event) => update('state', event.target.value)}><option value="">Select your state or Union Territory</option>{['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'].map((state) => <option key={state} value={state}>{state}</option>)}</select></label><Choice label="Where do you live?" name="residence" value={details.residence} options={fields.residence} onChange={update} /><Choice label="Do you identify as a person with disability?" name="disability" value={details.disability} options={fields.disability} onChange={update} /><div className="profile-actions"><button className="profile-submit" type="submit" disabled={!ready}>Continue to matches <span aria-hidden="true">↗</span></button><small>Your answers are used only to improve this conversation and matching.</small></div></form></main>
}
