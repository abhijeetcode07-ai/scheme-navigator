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

A dedicated "Latest Updates" page and a homepage feed section surface recent, source-attributed scheme announcements — each entry displays its origin (official/ministry source vs. reputable news) and links back to that source. The Vercel cron refreshes the feed through `GET /api/feed`, while ordinary public `GET` requests remain read-only. The current allowlist accepts PIB and other `*.gov.in`/`*.nic.in` sources plus ETGovernment; article links are validated against the same allowlist before storage. Refresh failures are reported per source rather than being silently presented as an empty feed.

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

For the live feed, set `SUPABASE_SERVICE_ROLE_KEY` on Vercel so the serverless refresh function can write to `feed_items`. Set `CRON_SECRET` as well; Vercel sends it as a bearer token on cron requests, and the API also recognizes Vercel's cron user-agent. Optional `NEWS_FEED_URLS` can override the built-in allowlisted sources, but every host is checked before it is fetched and every article URL is checked before it is stored. Manual refreshes require `FEED_REFRESH_SECRET` in the `x-feed-refresh-secret` header.

The built-in sources are the Press Information Bureau RSS feeds and ETGovernment's education RSS feed. These are deliberately narrow rather than using an unrestricted news aggregator, so the feed cannot silently mix in unverified blogs, scraped social posts, or anonymous sources.

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

```bash
npm run dev
```

Vite will print the local development URL, usually:

```text
http://localhost:5173
```

### Create a production build

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

### Run linting

```bash
npm run lint
```

## Environment Configuration

Create a local environment file at:

```text
frontend/.env
```

Add the Gemini key as a server-side variable:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Do not use a `VITE_` prefix for this secret. Variables beginning with `VITE_` are exposed to browser-side code by Vite and must not contain private API keys.

The `.env` file must never be committed to GitHub. The repository should contain only a safe template such as `.env.example`:

```env
# Server-side only. Never commit a real key.
GEMINI_API_KEY=
```

### Vercel environment variables

For production deployment, configure the following variables in the Vercel project settings:

```text
Project Settings → Environment Variables
```

| Variable | Scope | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Server-side | Google Gemini API key for multilingual scheme explanations and translations. |
| `GEMINI_MODEL` | Server-side | Optional; defaults to `gemini-2.5-flash`. |
| `NEWS_FEED_URLS` | Server-side | Comma-separated list of allowlisted RSS/Atom feeds (e.g. PIB, ETGovernment). |
| `FEED_REFRESH_SECRET` | Server-side | Secret header required for manual feed refresh (`x-feed-refresh-secret`). |
| `CRON_SECRET` | Server-side | Secret bearer token used by Vercel Cron to trigger daily feed ingestion. |
| `SUPABASE_URL` | Server-side | Supabase project URL for serverless endpoints. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side | Supabase service-role secret key for administrative feed writes. |
| `VITE_SUPABASE_URL` | Client & Server | Public Supabase endpoint for client-side queries and authentication. |
| `VITE_SUPABASE_ANON_KEY` | Client-side | Public Supabase anonymous key. |

Enable them for the environments where the application is deployed, normally **Production**, **Preview**, and optionally **Development**. Redeploy after changing variables.

## Live Feed System

The **Live Feed** provides a trustworthy, continuously refreshed public-information feed for Indian government schemes, scholarships, welfare, aid, and related official announcements.

### Official-First Source Hierarchy

SchemeSetu enforces a strict hierarchy and transparent attribution for all feed entries:

1. **Official Government Source (Primary):** Press Information Bureau (PIB) RSS (`https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1`).
2. **Ministry Announcements:** Verified official ministry feeds (`*.gov.in` / `*.nic.in`).
3. **Reputable News Fallback:** Trusted reporting from ETGovernment (`government.economictimes.indiatimes.com/rss/education`), strictly labeled as **Reputable news** and never represented as an official announcement.

Arbitrary hostnames outside the server-side allowlist are automatically rejected. All entries are deduplicated by `source_url`, sanitized to plain text, and link directly to the original public notice.

### Scheduled and Manual Ingestion

- **Scheduled Ingestion:** Vercel Cron automatically triggers `POST /api/feed` daily at `0 6 * * *` UTC using the configured `CRON_SECRET`.
- **Manual Maintainer Refresh:** Maintainers can trigger an immediate refresh with:

```bash
curl -X POST https://your-domain.vercel.app/api/feed \
  -H "x-feed-refresh-secret: your_feed_refresh_secret"
```

- **Client Consumption:** The browser loads live items via `GET /api/feed` (cached with `s-maxage=300, stale-while-revalidate=900`) and falls back gracefully to Supabase direct queries or an accessible offline state.

## AI and Data Safety Model

SchemeSetu follows a separated responsibility model:

| Responsibility | Implementation |
| --- | --- |
| Eligibility matching | Local deterministic JavaScript matcher |
| Canonical scheme records | Normalized dataset in `schemes.js` |
| Translation and explanation | Server-side Gemini proxy |
| Official application destination | Source URL from the scheme record |
| Fallback behavior | Verified local copy in the language dictionary |

Gemini receives the selected language, the user’s submitted context, and the relevant normalized scheme record. The prompt explicitly instructs the model not to add requirements, change eligibility, invent benefits, alter dates or amounts, or claim guaranteed approval.

The browser should communicate with the application proxy rather than directly exposing the Gemini credential. Never place `GEMINI_API_KEY` in React components, client-side modules, public assets, browser storage, or committed configuration files.

## User Flow

### 1. Landing page

The landing page communicates the core value proposition and provides the primary entry point into the discovery experience.

### 2. Language and context

Users select one of the eight supported languages and describe their situation using structured answers and optional natural-language context. The voice control can populate the free-text context field when supported by the browser.

### 3. Matching results

The local matcher filters the 43 normalized records. Each result shows a scheme name, a concise reason, and a clear interaction affordance. Users can edit their answers and try again.

### 4. Scheme detail

The detail screen separates the user’s fit, scheme support, application preparation, verification information, and official application action. Long titles wrap safely and do not overlap surrounding content.

### 5. Document checklist

The checklist summarizes documents associated with the selected record. Users can mark preparation items as complete before visiting the official source.

## Deployment on Vercel

The project is prepared for deployment on Vercel. A typical deployment process is:

```bash
cd scheme-navigator
git add .
git commit -m "Update SchemeSetu multilingual scheme translation"
git push origin main
```

When the GitHub repository is connected to Vercel, a push to `main` should create a new production deployment according to the project’s Vercel settings.

Before testing production, verify the following:

1. The latest commit is visible on GitHub’s `main` branch.
2. `GEMINI_API_KEY` is configured in Vercel.
3. The Vercel build command points to the `frontend` project directory if required.
4. The production deployment completed successfully.
5. Language selection persists from the input page through the results, detail, and checklist pages.
6. A non-English result displays translated scheme names and explanations.
7. The official application link still opens the canonical government source.

## Testing Checklist

Use this checklist before publishing a release:

| Area | Verification |
| --- | --- |
| Build | `npm run build` completes without errors. |
| Lint | `npm run lint` reports no warnings or errors. |
| Language | Test English plus at least two regional languages. |
| Persistence | Confirm the selected language remains active on every page. |
| Matching | Verify known eligible and ineligible test profiles. |
| AI fallback | Test the app with Gemini unavailable and confirm safe local copy appears. |
| Voice | Test microphone permission, recognition status, and typed-input fallback. |
| Accessibility | Navigate using the keyboard and inspect focus visibility. |
| Responsive layout | Test narrow mobile and wide desktop viewports. |
| Long content | Test long scheme names, long documents, and translated text wrapping. |
| Security | Confirm no API key appears in browser bundles or committed files. |
| Links | Confirm official application links open the intended source. |

## Known Limitations

Browser speech recognition is not uniformly supported across all browsers, operating systems, and languages. Text input remains available when recognition is unavailable or permission is denied.

AI translation requires a correctly configured server-side Gemini key. When Gemini is not configured, SchemeSetu does not stop working; it uses deterministic matching and verified fallback text. Because AI-generated explanations are not authoritative, users should always confirm current requirements on the official government source before applying.

Government schemes, application windows, income limits, and document requirements may change over time. The dataset should be reviewed and refreshed periodically from authoritative sources before production use.

## Contributing

Contributions are welcome. Before opening a pull request, please:

1. Explain the problem and the proposed change.
2. Keep eligibility logic separate from presentation logic.
3. Preserve the design-token system in `index.css`.
4. Avoid introducing Tailwind or unrelated styling systems.
5. Keep API keys and personal data out of commits.
6. Test keyboard navigation, responsive layout, reduced-motion behavior, and at least one regional language.
7. Run the build and lint commands before submitting.

For changes to scheme records, include the source, verification date, affected eligibility fields, and any official application URL updates.

## License

Add the project’s chosen license here before making the repository public or accepting external contributions. If no license is present, all rights remain reserved by default.


## Disclaimer

SchemeSetu aggregates and explains publicly available scheme information for discovery purposes only. Always confirm current eligibility, benefit amounts, deadlines, and required documents on the relevant ministry's official portal before applying. SchemeSetu does not process applications, collect government fees, or act on behalf of any government body.
