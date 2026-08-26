# SchemeSetu

### A conversational government-scheme finder for Indian students

<p align="center">
  <strong>Discover the right government schemes in your language, with confidence.</strong>
</p>

<p align="center">
  <a href="https://scheme-navigator-five.vercel.app/">Live Demo</a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://github.com/abhijeetcode07-ai/scheme-navigator">Repository</a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

**SchemeSetu** is a multilingual, conversational web application that helps Indian students discover central government scholarships, education benefits, and other relevant public schemes. Instead of forcing users to search through long and complex government portals, SchemeSetu asks for a small amount of context, matches the user against a verified scheme dataset, and explains the result in clear, accessible language.

The experience is designed for students who may not be comfortable with English, may be unfamiliar with government terminology, or may not know which scheme category applies to them. Users can select one of eight supported languages, optionally answer using voice input, review matched schemes, understand why they may qualify, and view a practical document checklist before applying.

> **SchemeSetu is an information and discovery tool. It does not guarantee approval, replace official government verification, or submit applications on behalf of users.**

## Why SchemeSetu?

Government-scheme information is often distributed across multiple websites, written in formal language, and difficult to compare. SchemeSetu simplifies the discovery journey into a guided conversation:

```text
Select a language
        ↓
Share a little context
        ↓
Receive deterministic scheme matches
        ↓
Read a plain-language explanation
        ↓
Review required documents
        ↓
Continue to the official application source
```

The app combines **deterministic eligibility matching** with **AI-assisted explanation**. The matching layer remains authoritative and is based on normalized scheme records. Gemini is used to translate and explain the supplied information; it is instructed not to invent requirements, alter eligibility, or guarantee approval.

## Core Features

### Conversational discovery

The application uses a five-step flow rather than presenting users with a dense search form:

| Page | Purpose |
| --- | --- |
| Landing | Introduces SchemeSetu and invites the user to begin. |
| Conversational Input | Collects the student’s context, preferences, and optional notes. |
| Results | Displays schemes that match deterministic eligibility rules and explains why each one may be relevant. |
| Scheme Detail | Presents eligibility context, support information, application guidance, verification details, and official links. |
| Document Checklist | Converts the scheme’s document requirements into a practical preparation list. |

### Eight-language interface

SchemeSetu supports the following languages:

| Language | Native name |
| --- | --- |
| English | English |
| Hindi | हिन्दी |
| Tamil | தமிழ் |
| Bengali | বাংলা |
| Malayalam | മലയാളം |
| Punjabi | ਪੰਜਾਬੀ |
| Marathi | मराठी |
| Kannada | ಕನ್ನಡ |

Language selection persists throughout the complete user journey. User-facing interface labels, instructions, match explanations, scheme display names, ministry names, detail copy, and document guidance are translated through the secure Gemini proxy when Gemini is configured. The canonical English dataset remains available internally for matching accuracy, official links, dates, amounts, and verification purposes.

### Voice input

The conversational input screen supports browser-based speech-to-text through the **Web Speech API**. Users can describe their situation naturally instead of typing everything manually. Voice recognition follows the selected language where the browser supports the relevant locale.

Because browser speech-recognition support varies by browser and operating system, the application keeps text input available as a reliable fallback. Microphone controls include accessible labels and status feedback.

### Deterministic eligibility matching

The scheme records are normalized from a CSV dataset containing 43 central government education and scholarship schemes. The matcher evaluates the supplied student context against structured eligibility fields such as category, gender, income, education level, state, disability status, and other relevant attributes.

The deterministic layer is intentionally separated from Gemini. This ensures that an AI response cannot silently change the set of matched schemes or introduce unsupported eligibility rules.

### Gemini-powered explanations

Gemini provides language-aware explanations using only the matched scheme record and the user’s submitted context. Depending on the selected language, the proxy can return:

- A translated scheme display name.
- A translated ministry or department name.
- A concise explanation of why the scheme may be relevant.
- Plain-language support or benefit information.
- Before-you-apply guidance.
- A translated document list.

If Gemini is unavailable, the application uses verified local fallback text rather than failing silently or displaying an empty page.

### Accessibility and motion preferences

The interface includes a practical accessibility baseline:

- Keyboard-visible focus states.
- Accessible labels for icon-only controls.
- Semantic buttons and links for interactive actions.
- Status messaging for voice recognition and AI responses.
- Text alternatives where visual effects are used.
- Support for `prefers-reduced-motion`.
- Responsive layouts for desktop and mobile screens.
- Long scheme titles that wrap instead of being clipped.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 with Vite |
| Language | JavaScript and JSX |
| Styling | Plain CSS with centralized design tokens |
| Motion | Motion and GSAP |
| WebGL / visual effects | OGL and Three.js |
| Voice | Browser Web Speech API |
| AI | Google Gemini through a server-side proxy |
| Deployment | Vercel serverless functions |
| Code quality | Oxlint |
| Data source | Normalized CSV scheme dataset |

The project intentionally uses **plain CSS rather than Tailwind CSS**. The visual system is based on reusable design tokens defined in `frontend/src/index.css`.

## Visual System

SchemeSetu uses a warm, trustworthy visual language intended to feel more approachable than a typical government portal.

| Token | Value | Role |
| --- | --- | --- |
| `--navy` | `#16233F` | Primary trust and heading color |
| `--navy-soft` | `#29406B` | Secondary navy surfaces |
| `--marigold` | `#E8A33D` | Accent and warmth |
| `--marigold-deep` | `#C4791C` | Accent hover and emphasis |
| `--paper` | `#FBF7EF` | Main background |
| `--card` | `#FFFFFF` | Card surfaces |
| `--teal` | `#2F7A6B` | Positive and success states |
| `--teal-soft` | `#E7F3F0` | Positive soft surfaces |
| `--ink` | `#1C2333` | Body text |
| `--muted` | `#6B7280` | Secondary text |
| `--line` | `#E6E0D2` | Borders and separators |
| `--danger` | `#A8402F` | Errors and warnings |

The primary display font is **Baloo 2** and the body font is **IBM Plex Sans**. Visual components adapted from open-source component libraries are retinted to the SchemeSetu palette; default purple, violet, pink, and cyan treatments are not used as brand colors.

## Project Structure

```text
scheme-navigator/
├── frontend/
│   ├── api/
│   │   └── gemini.js                 # Vercel API wrapper, if used by deployment setup
│   ├── public/
│   │   └── assets/                   # Textures and static visual assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentChecklist.jsx
│   │   │   ├── DocumentChecklist.css
│   │   │   ├── InputScreen.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Landing.css
│   │   │   ├── ResultsScreen.jsx
│   │   │   ├── ResultsScreen.css
│   │   │   ├── SchemeDetail.jsx
│   │   │   └── SchemeDetail.css
│   │   ├── data/
│   │   │   ├── languages.js           # Language metadata and translations
│   │   │   └── schemes.js             # Normalized records and matcher
│   │   ├── lib/
│   │   │   └── gemini.js              # Client-side proxy request helpers
│   │   ├── server/
│   │   │   └── gemini.mjs             # Secure Gemini request handler
│   │   ├── App.jsx                    # Main flow and application state
│   │   ├── App.css
│   │   └── index.css                  # Global styles and design tokens
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
├── api/
│   └── gemini.js                      # Root Vercel serverless entry, if configured
└── README.md
```

> The exact location of the Vercel API wrapper can depend on the repository’s current Vercel configuration. Keep the server-side handler and deployment wrapper aligned with the existing project structure when moving files.

## Getting Started

### Prerequisites

Install the following before running the project locally:

- Node.js 18 or newer.
- npm, pnpm, or another Node package manager.
- A modern Chromium-based browser for the best voice-input support.
- A Google Gemini API key if AI translation and explanations are required.

### Installation

Clone the repository and enter the frontend directory:

```bash
git clone https://github.com/abhijeetcode07-ai/scheme-navigator.git
cd scheme-navigator/frontend
npm install
```

### Start the development server

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

For production deployment, add the same variable in the Vercel project settings:

```text
Project Settings → Environment Variables → GEMINI_API_KEY
```

Enable it for the environments where the application is deployed, normally **Production**, **Preview**, and optionally **Development**. Redeploy after changing the variable.

If an API key has ever been shared in chat, screenshots, commits, or public repositories, revoke it and create a replacement before deploying.

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

SchemeSetu is an educational and discovery interface. It is not affiliated with, operated by, or an official representative of any Indian government ministry, department, scholarship authority, or public-sector organization unless explicitly stated by the project owner. Users should verify eligibility, deadlines, documents, and application instructions on the official government website before taking action.

## Project Links

- **Live application:** [scheme-navigator-five.vercel.app](https://scheme-navigator-five.vercel.app/)
- **GitHub repository:** [abhijeetcode07-ai/scheme-navigator](https://github.com/abhijeetcode07-ai/scheme-navigator)

---

<p align="center">
  Built to make public benefits easier to discover, understand, and access.
</p>
