<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Ogden 850 Basic English Tutor

This is a comprehensive interactive web application built to master Ogden's Basic English (850 core words).

View the live production app: https://ogden850app.vercel.app/

## 🏗️ Technical Architecture (MVC Pattern)

To maintain a clean, scalable, and readable codebase, the project follows a modern React MVC (Model-View-Controller) architecture, totally completely decoupling UI from Business Logic and Data fetching.

### 🗂️ Project Structure

```text
src/
├── config/              # ⚙️ Global configurations (storage keys, constants)
│   └── index.ts
├── router/              # 🚦 (Controller) API route maps & Frontend route orchestration
│   └── api.ts           # Mapping for backend API routes
├── services/            # 🧠 (Model/Logic) Pure business logic & External API calls
│   ├── ai.service.ts    # AI Evaluation and LLM Prompts
│   ├── tts.service.ts   # Sonia 预录 MP3 播放（本地 public/ → omega CDN），无实时合成
│   ├── firebase.ts      # Cloud database connectivity
│   └── progress.ts      # State syncing managers
├── views/               # 🎨 (View) Pure UI Layout Pages
│   ├── HomeView.tsx     # Landing & Dashboard
│   ├── BrowserView.tsx  # Interactive Dictionary List
│   ├── PracticeView.tsx # Workspace for AI-powered sentence building
│   └── StatsView.tsx    # User analytics and learning tracking
├── components/          # 🧩 Reusable UI Components
│   └── ...
├── data/                # 💾 Static Datasets (850 words taxonomy)
│   └── wordsList.ts
└── App.tsx              # 🎯 Root Entry Point (Delegates routes to Views)
```

### 🧩 Separation of Concerns (The Golden Rules)
1. **Views & Components (`src/views/`, `src/components/`)**: Responsible **ONLY** for UI layout and rendering. They should not contain raw database `fetch` calls, audio element logic, or hardcoded API keys.
2. **Services (`src/services/`)**: Responsible for data fetching, caching, API calls, and heavy business logic. Views call these services to get data or trigger actions.
3. **Router & Config (`src/router/`, `src/config/`)**: Decouple the environment and URL mappings so the application can be seamlessly updated or proxied.

## 🚀 Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set API keys in `.env.local` only if you run LLM/audit scripts (not needed for pronunciation).
3. Run the app:
   `npm run dev`

### 🔊 发音（预录 MP3，非实时 TTS）

- 音源：`edge-tts` · `en-GB-SoniaNeural`
- 场景对话：`npm run audio:scenes` → `public/audio/sentences/{id}.mp3`（须随部署提交）
- 单词例句：`npm run audio:guides` → `public/assets/audio/guides/`
- 850 词：`npm run audio:sync`（从 omega CDN 拉取）
- 播放：`tts.service.ts` 只读 MP3，**无** `/api/tts`、无 Gemini 实时合成

## 📦 Deployment
The application is automatically deployed to Vercel on every major update.
To manually deploy to production:
`npx vercel --prod --yes`
