# Onyapo 🌿

*Onyapo* is Twi shorthand for “you get muscles.”

**A responsive, GitHub-ready fitness website sourced from two anatomical Excel workbooks.** Green-and-blue styling; home/gym workout rotation; progress tracking; email-confirmed accounts; interactive muscle atlas; searchable library; customizable, non-gendered avatar; friend codes and uplifting messages; incremental video support.

> **Project status:** full source starter implementation with functional offline demo and optional Supabase cloud integration. This package has not been deployed to a live website. Run the installation and tests locally and configure your own Supabase/hosting accounts before advertising it as a public service. Authentication and social features only function in cloud mode.

## What's new in Onyapo

- The app is renamed **Onyapo**, including the page title, onboarding, application branding, documentation, npm package and GitHub setup examples. Suggested new repository: `onyapo`.
- The **Avatar Studio** offers cornrows, short locs, long locs, braids, twists, afros, buns, short/long hair, and no hair; adjustable facial hair, glasses, hats, eye shape and expressions, alongside existing skin/hair color and proportions. All options are non-gendered.
- In **My workout**, each strength movement now shows **“Last time you did [exercise]”**, with the recorded date and completed sets. Individual rows show the previous set's weight in kg or band resistance and number of bands. It reads history already stored with that account. First-time movements show a friendly placeholder. The comparison excludes the active workout, skipped movements, and uncompleted sets.
- **Existing users keep their progress:** the unchanged Supabase tables and persisted exercise IDs are compatible. Old avatar JSON fields get safe defaults for the new controls. In offline demo mode, newer `onyapo_` browser keys fall back to legacy `vm_` keys. Don't clear local browser storage or create a new Supabase project if you want to retain existing data.
- No database migration is required specifically for the expanded avatar fields or previous-set comparison; avatar JSON and workout plan JSON were already used.

**Note:** the previous-set feature compares exact exercise IDs, not similar exercises; data appears only after a set has been checked off in an earlier session, and history is currently limited to the latest 300 stored sessions per user. Weight is in **kilograms**.

## Quick start (local offline demo)

Requires **Node.js 22+**, **npm**, and **Python 3.10+** (for spreadsheet re-imports only).

```bash
# macOS / Linux
bash scripts/setup.sh
npm run dev
```

```powershell
# Windows PowerShell
.\scripts\setup.ps1
npm run dev
```

Or manually: `npm install`, then `npm run dev`, open the printed local URL. Click **Explore offline demo**. Offline demonstration state uses the browser's `localStorage`; it is NOT a secure login and does NOT synchronize devices.

## Activate verified accounts

1. Create a free/paid-as-needed **Supabase** project. In **SQL Editor**, run `supabase/migrations/0001_initial.sql` once.
2. In **Authentication → Providers → Email**, enable the email provider and **Confirm email**. Customize templates and use your own SMTP provider for a real public site; default email quotas are limited.
3. Open **Project Settings → API**. Use the project URL and the **public/anon/publishable key**, never the `service_role` or secret key.
4. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. In **Authentication → URL Configuration**, add your local `http://localhost:5173/` (and deployment URL later) as redirect URLs. Set the Site URL to your actual deployed site once live.
6. Restart `npm run dev`. Register, confirm the link sent to your email, then sign in. The database stores account profiles, workout sets & per-set metrics in session JSON, 20-XP rewards, friends and messages.

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for GitHub, GitHub Pages, Vercel, deployment settings, privacy and launch checklist.

## Core data

- **349 muscle entries** from `source/Muscle_Atlas.xlsx`, including attachment and innervation data.
- **376 movements** from `source/Exercise_Atlas.xlsx`, including primary/assisting/stabilizing muscles, lengthened muscles, connective-tissue relationships, descriptions, home/gym classifications and precautions.
- Regenerated normalized files: `src/data/muscles.json` and `src/data/exercises.json`.
- Videos: `src/data/videos.json` (starts empty by design).
- Donations/foundation links: `src/data/links.json` (intentionally empty until you supply verified URLs).

For every Excel edit, preserve the **sheet names, header row (row 3), exercise IDs, and column order**; run:

```bash
npm run import:data
npm run validate:data
npm test
```

Do not manually add synthetic exercise/muscle entries to the JSON. Re-import the source workbook. The Python import uses only standard library modules (ZIP/XML/JSON), no third-party Python dependencies.

## Add a video over time

You do not need to modify the workout generator or exercise record. Add one file at a time by stable exercise ID:

```bash
python3 scripts/add_video.py EX0001 --file ~/Videos/push-up.mp4 --caption "Side view and easy variations"
# OR attach a YouTube demonstration
python3 scripts/add_video.py EX0001 --youtube 'https://youtu.be/XXXXXXXXXXX'

npm run validate:data
```

This registers the URL in `src/data/videos.json` and (for local files) copies a supported video into `public/videos/`. The app renders a player where available and a clearly labeled placeholder where not. Commit the changes and push to GitHub to publish incrementally.

**Permissions matter:** only use videos you own or are licensed to distribute. Captions/transcripts are recommended for accessibility. For many or large videos, use a dedicated video host/CDN; browser-embedded YouTube is supported as a lightweight option.

## Workout and XP model

- Aim for **4 dynamic/gentle warm-up stretches → 8 strengths → 4 cool-down stretches**.
- Strength: **3 sets × 6 reps**; isometric strength: **3 × 30 seconds**.
- Static/hold stretches: **15 breaths**; movement stretches: **5 slow repetitions**.
- Isolation overlap check disallows another exercise that uses the isolated target as a primary or assisting fatiguing muscle in that session.
- Region balancing and novelty/recency scoring reduce overconcentration and revisit previously used exercises across sessions.
- Home uses exclusively Home-labeled exercises; Gym may use gym equipment plus Home-labeled movements doable at the gym.
- A skipped exercise is hidden from the current plan after a **confirmation and required reason**. At least 4 strength exercises must be completed to finish.
- Band exercises ask for light/medium/heavy resistance and number of bands per set. Gym-labeled resistance movements ask for kilograms per set (0 is allowed for unloaded work).
- Each marked set changes green; the progress bar counts all non-skipped sets. A complete workout gives **20 XP** once through a Supabase database function (or local demo state).
- Levels start at **100, 500, 1,500, 3,000, 5,000, 10,000** cumulative XP, and grow by 5,000 thereafter.

More detail and limitations: [ALGORITHM.md](ALGORITHM.md).

## Project map

```text
onyapo/
├── source/                original XLSX anatomy & movement atlases
├── scripts/               setup helpers, Excel importer, video registration, validator
├── src/
│   ├── App.tsx            pages: dashboard, workout, atlas, library, friends, about, profile
│   ├── style.css          responsive visual design (blue/green)
│   ├── components/        avatar, onboarding tutorial, video player
│   ├── data/              normalized JSON, video registry, donation registry
│   └── lib/               exercise algorithm, cloud/local storage, Supabase, XP
├── public/videos/         incremental self-hosted demos
├── supabase/migrations/   SQL schema, RLS and XP-awarding RPC
├── tests/                 automated planner/data/XP tests
└── .github/workflows/     CI and GitHub Pages deployment
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Type-check and build deployable static files into `dist/` |
| `npm run preview` | View compiled build locally |
| `npm test` | Unit tests for planner, modes, muscle restrictions and XP thresholds |
| `npm run import:data` | Re-import edited source XLSX files into optimized JSON |
| `npm run validate:data` | Validate source IDs, muscle links, settings, video registry |

## Caution and attribution

Source atlases are **anatomy-based mappings, not muscle-by-muscle EMG or clinical validation**. The illustrated body map is a **schematic region illustration**; some muscles have no safe isolated exercise. No fitness website can guarantee optimum recovery or that every anatomical entry receives an effective training dose. Ligaments should not be intentionally stretched; displayed ligament data is joint context only. Users should stop with painful or alarming symptoms and seek qualified clinical guidance as appropriate.

Do not publish personal medical or sensitive exercise information in friend messages. XP is recreational and not suitable as a tamper-proof competition or money-linked system. Before operating publicly: add privacy/terms, accessibility review, moderation/abuse report process, account-data deletion process, video rights review and a production mail provider. See the launch checklist.
