import { getLanguage } from './languages'
import { schemes as legacySchemes } from './schemes'
import dossierSchemes from './masterSchemes.json'
import jobsSchemes from './jobsSchemes.json'

const categoryNames = {
  education: 'Education',
  health: 'Health & Wellness',
  jobs: 'Jobs & Skills',
  housing: 'Housing & Utilities',
  finance: 'Finance & Insurance',
  agriculture: 'Agriculture & Livelihoods',
  women: 'Women & Child',
  social: 'Social Justice',
  disability: 'Disability Support',
}

const categoryIds = Object.fromEntries(Object.entries(categoryNames).map(([id, name]) => [name, id]))
const categoryAliases = {
  'Health and Wellness': 'Health & Wellness',
  'Finance and Insurance': 'Finance & Insurance',
  'Agriculture and Livelihoods': 'Agriculture & Livelihoods',
  'Women and Child': 'Women & Child',
  Disability: 'Disability Support',
}

function canonicalCategory(value = '') {
  const text = String(value).trim()
  if (categoryNames[text]) return categoryNames[text]
  if (categoryAliases[text]) return categoryAliases[text]
  const lowered = text.toLowerCase()
  return Object.entries(categoryNames).find(([id, name]) => lowered === id || lowered === name.toLowerCase())?.[1] || text
}

function normalizeLegacy(scheme) {
  return { ...scheme, category: 'Education', displayName: scheme.displayName || scheme.name, sourceType: 'existing-verified' }
}

function normalizeRecord(scheme, sourceType) {
  const category = canonicalCategory(scheme.category || scheme.sourceSection)
  return {
    ...scheme,
    id: scheme.id || `${sourceType}-${scheme.serial}-${String(scheme.name).slice(0, 12).replace(/\W+/g, '-').toLowerCase()}`,
    category,
    displayName: scheme.displayName || scheme.name,
    sourceType,
    active: scheme.active !== false,
    categories: scheme.categories || [category],
    plainEligibility: scheme.plainEligibility || scheme.officialEligibility || 'Check the official scheme page for the current eligibility conditions.',
    benefits: scheme.benefits || 'Check the official scheme page for the current benefit details.',
    documents: Array.isArray(scheme.documents) ? scheme.documents : [],
    officialApplyLink: scheme.officialApplyLink || scheme.verificationSourceLink || '',
    lastVerifiedDate: scheme.lastVerifiedDate || '2026-08-30',
  }
}

const allRecords = [
  ...legacySchemes.map(normalizeLegacy),
  ...dossierSchemes.map((scheme) => normalizeRecord(scheme, 'master-dossier')),
  ...jobsSchemes.map((scheme) => normalizeRecord(scheme, 'jobs-supplement')),
]

const deduped = new Map()
for (const scheme of allRecords) {
  const key = `${scheme.category}:${String(scheme.name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`
  if (!deduped.has(key) || scheme.sourceType === 'existing-verified') deduped.set(key, scheme)
}

export const fullSchemes = [...deduped.values()]
export const schemeCategoryIds = categoryIds
export const schemeCategoryNames = categoryNames
export const categoryRecordCounts = Object.fromEntries(Object.values(categoryNames).map((category) => [category, fullSchemes.filter((scheme) => scheme.category === category).length]))

const incomeRanks = {
  'Below ₹1L': 100000,
  '₹1L–₹2.5L': 250000,
  '₹2.5L–₹5L': 500000,
  'Above ₹5L': 800000,
}

const educationPatterns = {
  School: /class|school|ix|x|xi|xii|9-10|9-12|1-10|11-12/i,
  Undergraduate: /\bug\b|undergraduate|degree|diploma|b\.|bachelor/i,
  Postgraduate: /\bpg\b|postgraduate|ph\.?d|fellowship|research|master|m\./i,
}

function extractIncomeLimit(value = '') {
  if (/no income|not specified|not applicable|verify current|unknown/i.test(value)) return null
  const lakh = value.match(/₹?\s*([0-9]+(?:\.[0-9]+)?)\s*lakh/i)
  if (lakh) return Number(lakh[1]) * 100000
  const rupees = value.match(/₹\s*([0-9][0-9,]*)/)
  return rupees ? Number(rupees[1].replace(/,/g, '')) : null
}

function categoryMatches(scheme, selectedCategory) {
  return scheme.category === canonicalCategory(selectedCategory) || scheme.categories?.some((item) => canonicalCategory(item) === canonicalCategory(selectedCategory))
}

function incomeMatches(scheme, income) {
  const requested = incomeRanks[income]
  const limit = scheme.incomeLimit ?? extractIncomeLimit(scheme.incomeCeiling)
  return !requested || limit === null || limit === undefined || limit >= requested
}

function educationMatches(scheme, education) {
  if (!education || !educationPatterns[education]) return true
  return educationPatterns[education].test(`${scheme.educationLevel || ''} ${scheme.plainEligibility || ''}`)
}

function fieldText(answers) {
  return Object.entries(answers || {}).filter(([key]) => !['language', 'category'].includes(key)).map(([key, value]) => `${key} ${value}`).join(' ').toLowerCase()
}

function buildReason(scheme, answers) {
  const language = getLanguage(answers?.language).name
  const category = categoryNames[answers?.category] || scheme.category
  const qualification = answers?.education || answers?.employmentStatus || answers?.ageGroup || 'your profile'
  const income = answers?.income ? ` and ${answers.income} income range` : ''
  const reason = `Fits the ${category} route for ${qualification}${income}.`
  if (language === 'Hindi') return `यह ${category} मार्ग में ${qualification}${income} के लिए उपयुक्त है।`
  return reason
}

export function matchSchemes(answers) {
  if (!answers?.category) return []
  const searchText = fieldText(answers)
  return fullSchemes.filter((scheme) => scheme.active && categoryMatches(scheme, answers.category) && incomeMatches(scheme, answers.income) && educationMatches(scheme, answers.education)).map((scheme) => {
    const haystack = `${scheme.name} ${scheme.categoryTags || ''} ${scheme.plainEligibility || ''} ${scheme.benefits || ''}`.toLowerCase()
    const keywordHits = searchText.split(/\s+/).filter((token) => token.length > 3 && haystack.includes(token)).length
    const score = 6 + Math.min(keywordHits, 8) + (scheme.sourceType === 'existing-verified' ? 1 : 0)
    return { ...scheme, score, reason: buildReason(scheme, answers) }
  }).sort((a, b) => b.score - a.score || a.displayName.localeCompare(b.displayName))
}

export function getCategoryRecords(categoryId) {
  const category = categoryNames[categoryId] || canonicalCategory(categoryId)
  return fullSchemes.filter((scheme) => scheme.category === category)
}
