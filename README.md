# SchemeSetu

### A conversational government-scheme finder for Indian citizens

<p align="center">
  <strong>Answer a few questions. Find the schemes you actually qualify for. Understand them in plain language.</strong>
</p>

<p align="center">
  <a href="https://scheme-navigator-five.vercel.app/">Live Demo</a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://github.com/abhijeetcode07-ai/scheme-navigator">Repository</a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#getting-started">Getting Started</a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?logo=supabase&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/AI-Google%20Gemini-8E75B2">
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white">
</p>

---

## Overview

**SchemeSetu** helps Indian citizens discover the central government schemes, scholarships, and welfare programmes they may actually qualify for — without having to search across dozens of ministry websites written in dense official language.

Instead of a search bar, SchemeSetu asks the user which part of life they need support in, collects a short set of category-specific answers, and returns a **deterministic** shortlist of matching schemes. Every match comes with a plain-language explanation of why the user qualifies, what the scheme provides, what documents are needed, and a direct link to apply on the official government portal.

> **SchemeSetu is an information and discovery tool. It does not guarantee approval, replace official government verification, or submit applications on behalf of users.**

## Why SchemeSetu?

Government scheme information in India is scattered, inconsistently worded, and hard to compare — especially across the many categories of support beyond education (health, housing, agriculture, disability, and more). SchemeSetu turns that search into a guided, five-step journey:

```text
Choose a category
        ↓
Answer a few category-specific questions
        ↓
Receive a deterministic shortlist of matching schemes
        ↓
Read a plain-language breakdown of one scheme
        ↓
Review the document checklist and apply on the official portal
```

The matching layer is **deterministic and rule-based** — it does not rely on AI to decide who qualifies for what. AI (Gemini) is layered on top only for explanation, translation, and conversational help; it is never the source of truth for eligibility.

## Core Features

### Nine-category conversational discovery

The homepage routes into a category-selection screen covering all nine support areas SchemeSetu currently indexes:

| Category | Focus |
| --- | --- |
| Education | Scholarships, fee support, fellowships, education access |
| Health & Wellness | Health cover, treatment support, maternal care |
| Jobs & Skills | Skilling, apprenticeships, employment, livelihood training |
| Housing & Utilities | Housing, sanitation, electricity, cooking fuel, water |
| Finance & Insurance | Pensions, insurance, credit, income-support schemes |
| Agriculture & Livelihoods | Farmer income support, crop insurance, rural enterprise |
| Women & Child | Nutrition, protection, safety, family wellbeing |
| Social Justice | Welfare and inclusion for underserved communities |
| Disability Support | Assistive devices, rehabilitation, accessibility support |

Each category routes into its own version of the input screen, the match-results screen, the scheme-detail screen, and the document-checklist screen, so the experience stays relevant to what the user actually needs — a farmer isn't asked the same questions as someone looking for disability support.

### Deterministic eligibility matching

The scheme dataset combines the original 43 verified education/scholarship records with a much larger research dossier covering the remaining eight categories. The matching engine (`data/fullSchemes.js`) normalizes every record into a single canonical shape, deduplicates overlapping entries, and filters on:

- Selected category
- Income bracket (parsed against each scheme's stated income ceiling)
- Education level (school / undergraduate / postgraduate, matched against eligibility text)
- Free-text context supplied by the user, scored by keyword relevance

Matches are ranked by a transparent score, not a black-box model, so the same inputs always produce the same shortlist.

### SetuSathi — AI assistant

SetuSathi is an in-app chat assistant that can answer follow-up questions about a user's matched schemes, grounded only in the scheme records currently in view (it does not invent eligibility rules). For signed-in users, conversations are saved to Supabase and can be resumed later. Right now, the backend logic behind SetuSathi needs further work — see [Roadmap](#roadmap).

### Verified account history

Users can sign in with Google or email (via Supabase Auth) to save their scheme conversations and chat history across sessions. Sign-in is optional — the core matching flow works fully without an account.

### Latest Updates feed

A dedicated "Latest Updates" page and a homepage feed section surface recent, source-attributed scheme announcements — each entry displays its origin (official/ministry source vs. reputable news) and links back to that source. The underlying data model and API route are already built; wiring this up to a live, continuously-updated feed of verified central-government and official news sources is in progress — see [Roadmap](#roadmap).

### Full scheme catalogue

A dedicated "Find support by sector" catalogue page lets users browse every published scheme record directly — filterable by all nine categories, searchable by scheme name, ministry, or need — independent of the guided matching flow.

### Multilingual interface

The interface currently supports seven languages, with language selection persisting through the full user journey:

| Language | Native name |
| --- | --- |
| English | English |
| Hindi | हिन्दी |
| Marathi | मराठी |
| Tamil | தமிழ் |
| Kannada | ಕನ್ನಡ |
| Malayalam | മലയാളം |
| Bengali | বাংলা |

Interface labels, match explanations, and scheme detail copy are translated through the Gemini proxy where configured; the canonical English dataset remains the source of truth for matching accuracy, official links, and verification.

### Voice input

The input screens support browser-based speech-to-text through the Web Speech API, so users can describe their situation instead of typing it. Text input remains available as a fallback wherever voice recognition isn't supported by the browser.

### Custom animated visual system

SchemeSetu doesn't use a third-party animation library for its signature effects — the visual language (Black Hole background, India-focused Globe, Magic Rings, Split Flap Text, Magic Bento cards, Border Glow, Topography, Animated List, Scroll Stack, Laser Flow, Stroke Text, Curved Loop, Shape Grid, Stepper, GhostFibers, and Molten Metal) is built as a first-party component set (`components/VisualStack.jsx` and category-specific effects) driven by GSAP, Motion, OGL, and Three.js, so every page in the flow shares one consistent, high-signal identity.

### Accessibility

- Keyboard-visible focus states
- Accessible labels for icon-only controls
- Semantic buttons and links for interactive actions
- Status messaging for voice recognition and AI responses
- Support for `prefers-reduced-motion`
- Responsive layouts for desktop and mobile
- Long scheme titles wrap instead of clipping

## Roadmap

These are the next three things actively being worked on:

- [ ] **Live verified news feed** — connect the existing "Latest Updates" data model to a continuously updated pipeline of verified central-government sources and official national news references, so the feed reflects current scheme announcements automatically rather than relying on manual/seeded entries.
- [ ] **SetuSathi backend fix** — SetuSathi's chat backend isn't fully working yet; the underlying request/response and grounding logic needs to be rebuilt so it reliably answers questions using only verified scheme data.
- [ ] **Homepage UI/UX redesign** — a full visual and structural refresh of the landing page, in line with the rest of the site's current visual system.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 with Vite |
| Language | JavaScript and JSX |
| Styling | Plain CSS with centralized design tokens |
| Motion / visual effects | GSAP, Motion, OGL, Three.js (custom first-party components) |
| Voice | Browser Web Speech API |
| Auth & data | Supabase (Postgres, Auth, Row-Level Security) |
| AI | Google Gemini through a server-side proxy |
| Deployment | Vercel (static frontend + serverless API functions) |
| Code quality | Oxlint |
| Data source | Curated JSON/JS scheme dossier across 9 categories |

## Data Layer

- `data/schemes.js` — the original 43 verified education and scholarship records.
- `data/masterSchemes.json` — the research dossier covering Health & Wellness, Housing & Utilities, Finance & Insurance, Agriculture & Livelihoods, Women & Child, Social Justice, and Disability Support.
- `data/jobsSchemes.json` — supplementary Jobs & Skills records.
- `data/fullSchemes.js` — merges, normalizes, deduplicates, and exposes the combined dataset to the rest of the app, along with the matching function (`matchSchemes`) and per-category record counts.

Supabase tables (`supabase/migrations/`) mirror this structure for published, translated, and status-tracked scheme records, plus feed items and chat history, so content can eventually be managed and updated without a redeploy.

## Project Structure

```text
scheme-navigator/
├── frontend/
│   ├── api/
│   │   ├── gemini.js                 # Gemini proxy (chat, translation, explanations)
│   │   ├── schemes.js                # Published scheme records API
│   │   ├── feed.js                   # Latest Updates feed API
│   │   └── _lib/supabase-admin.js
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.jsx / .css
│   │   │   ├── CategoryPage.jsx / .css
│   │   │   ├── InputScreen.jsx / .css
│   │   │   ├── ResultsScreen.jsx / .css
│   │   │   ├── SchemeDetail.jsx / .css
│   │   │   ├── DocumentChecklist.jsx / .css
│   │   │   ├── BrowseSchemes.jsx / .css     # Full catalogue page
│   │   │   ├── LatestFeed.jsx                # Homepage feed section
│   │   │   ├── LatestUpdates.jsx / .css      # Dedicated updates page
│   │   │   ├── AuthPanel.jsx / .css          # Supabase sign-in
│   │   │   ├── SetuSathi.jsx / .css          # AI assistant
│   │   │   ├── ProfileDetails.jsx / .css
│   │   │   ├── VisualStack.jsx / .css        # Shared animated components
│   │   │   ├── GhostFibers.jsx / .css        # Category-page background
│   │   │   └── MoltenMetal.jsx / .css        # Landing-page background
│   │   ├── data/
│   │   │   ├── schemes.js
│   │   │   ├── masterSchemes.json
│   │   │   ├── jobsSchemes.json
│   │   │   ├── fullSchemes.js
│   │   │   └── languages.js
│   │   ├── lib/
│   │   │   ├── gemini.js
│   │   │   ├── supabase.js
│   │   │   └── catalog.js
│   │   ├── server/gemini.mjs
│   │   ├── App.jsx / .css
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── supabase/
│   ├── migrations/                   # Schema: profiles, schemes, translations, feed, chat
│   └── seed/                         # Canonical + verified batch seed data
└── catalog-research/                 # Verified scheme research batches
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A Supabase project (for auth, saved history, and the published-schemes/feed APIs)
- A Google Gemini API key (for translation, explanations, and SetuSathi)

### Environment Variables

Set these for the frontend (see `frontend/env.example`):

```text
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

Set the Gemini key as a server-side environment variable on your deployment platform (Vercel) — never exposed to the client.

### Install & Run

```bash
cd frontend
npm install
npm run dev       # start the local dev server
npm run build      # production build
npm run preview     # preview the production build
npm run lint       # run Oxlint
```

### Database Setup

Run the SQL files in `supabase/migrations/` (in order) against your Supabase project, then optionally load `supabase/seed/` for canonical and verified scheme data.

## Disclaimer

SchemeSetu aggregates and explains publicly available scheme information for discovery purposes only. Always confirm current eligibility, benefit amounts, deadlines, and required documents on the relevant ministry's official portal before applying. SchemeSetu does not process applications, collect government fees, or act on behalf of any government body.
