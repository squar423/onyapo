# Onyapo 🌿

*Onyapo* is Twi shorthand for “you get muscles.”

**A responsive, fitness website sourced from anatomical workbooks.** now with home/gym workout rotation; progress tracking; email-confirmed accounts; interactive muscle atlas; searchable library; customizable avatar(a work in progress); friend codes; soon to be added video support.

## What's new in Onyapo

- The app is renamed **Onyapo**, including the page title, onboarding, application branding, documentation

- The **Avatar Studio** offers more hair options, glasses, hats, eye shape and expressions, alongside existing skin/hair color and proportions.
- In **My workout**, each strength movement now shows **“Last time you did [exercise]”**, with the recorded date and completed sets. Individual rows show the previous set's weight in kg or band resistance and number of bands. It reads history already stored with that account. First-time movements show a friendly placeholder. The comparison excludes the active workout, skipped movements, and uncompleted sets.
- **Existing users keep their progress:** the unchanged Supabase tables and persisted exercise IDs are compatible. Old avatar JSON fields get safe defaults for the new controls. This will be the case for all future updates as well. 
- No database migration is required specifically for the expanded avatar fields or previous-set comparison; avatar JSON and workout plan JSON were already used.

**Note:** the previous-set feature compares exact exercise IDs, not similar exercises; data appears only after a set has been checked off in an earlier session, and history is currently limited to the latest 300 stored sessions per user. Weight is in **kilograms**.


## Core data

- **349 unique muscle entries** including attachment and innervation data.
- **376 unique muscle movements** including primary/assisting/stabilizing muscles, lengthened muscles, connective-tissue relationships, descriptions, home/gym classifications and precautions.


## Workout and XP model

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
## Disclaimer

Do not publish personal medical or sensitive exercise information in friend messages. XP is recreational and not suitable as a tamper-proof competition or money-linked system. Before operating publicly: add privacy/terms, accessibility review, moderation/abuse report process, account-data deletion process, video rights review and a production mail provider. See the launch checklist.
