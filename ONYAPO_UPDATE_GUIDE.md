# Onyapo 1.1 — live-site update and editing manual

**Applies to the existing GitHub → Vercel → Cloudflare → Supabase + Resend setup.** This is an *incremental* upgrade, not a new website. Preserve your existing Supabase project, Vercel project, Cloudflare records, GitHub repository, custom domain, and user data.

## Do this first: fix live signup

The earlier message “Configure Supabase for verified accounts” comes from `src/lib/store.tsx` when the Supabase client is **not configured at build time**. Having a working domain and Resend SMTP *does not* supply Supabase API values to Vercel.

1. Visit **Supabase Dashboard → your current project → Connect** (or Settings → API Keys / Data API). Copy **Project URL** (e.g., `https://abcdef.supabase.co`) and **publishable** `sb_publishable_...` key. **Never use a secret or `service_role` key in a Vite front end.**
2. Visit **Vercel → Onyapo project → Settings → Environment Variables**. In the **Production** environment, add exactly:
   - `VITE_SUPABASE_URL` = your actual Project URL
   - `VITE_SUPABASE_ANON_KEY` = your publishable key
   - Alternatively, Onyapo 1.1 recognizes `VITE_SUPABASE_PUBLISHABLE_KEY` instead of the `ANON_KEY` name.
3. Save. **Redeploy** production: Vercel → Deployments → latest good deployment → ellipsis → Redeploy, or push a new commit after setting the variables. A running deployment does not receive newly entered build-time Vite variables retroactively.
4. In **Supabase → Authentication → URL Configuration**, set **Site URL** to `https://onyapo.com/` and include `https://onyapo.com/**` plus your localhost URL in the allowed redirect list. Keep email confirmation enabled.
5. **Resend API/SMTP credentials belong in Supabase Authentication → SMTP**, *not* in Vercel VITE variables. Resend handles delivery; Supabase handles sign-in. Confirm the sender domain is verified in Resend.
6. In a private browser window, open `https://onyapo.com`, create a **new** test user, confirm their email, sign in, log a test session, then sign out and back in. If authentication works but profile saving fails, inspect Supabase Auth logs and confirm you ran `0001_initial.sql` when you initially created the database.

The new signup screen gives a clearer project-owner configuration alert if required variables are absent. The update *cannot* substitute real account credentials that only you can obtain from your Supabase project.

Official references: https://vercel.com/docs/environment-variables and https://supabase.com/docs/guides/auth/quickstarts/react

## Installation order for the new version

### 1. Back up existing work

Use GitHub's current `main` branch as your rollback point. In GitHub Desktop, commit any local changes before copying updated files. If you have custom changes in `App.tsx` or `style.css`, compare/merge rather than blindly replacing them.

### 2. Run ONLY the new database migration

In **your existing Supabase project → SQL Editor → New Query**, copy the contents of:

`supabase/migrations/0002_friend_activity.sql`

Run it once. **Do not rerun `0001_initial.sql`**. The 0002 upgrade adds `profiles.share_activity` (defaults to false) and a tightly scoped read-only `friend_activity_feed` function that returns only completed activity from accepted friends who opted in. It does not reset workouts, XP, or accounts.

Do this *before* pushing the revised front-end: the new Profile editor sends `share_activity` when saving a profile.

### 3. Upgrade your existing GitHub project, without starting over

- Download the **overlay ZIP** (only changed/new files) or the complete v1.1 project. Open the folder containing the current Git repository's `package.json`.
- **Overlay method:** copy the contents of the overlay's `onyapo/` folder directly into the existing repository folder, keeping the matching `src/`, `supabase/`, `tests/` structure. When prompted, replace matching source files; do **not** replace your `.env`, do **not** delete `.git/`, and do not delete other existing files.
- **Full project method:** copy changed files, preferably with VS Code Compare, instead of creating a new repo. The full ZIP includes the unchanged source spreadsheets/data.
- Verify the `src/config/siteCopy.ts` file now exists, plus `src/components/GuidePage.tsx`, `src/components/AnatomicalBody.tsx`, and migration 0002.

### 4. Test locally

From the existing Git project folder:

```bash
npm install
npm run validate:data
npm test
npm run build
npm run dev
```

Open the local URL and check: Tutorial page; avatar hair, face and accessories; atlas front/back human positions; second-workout warning after completing a workout; friend activity sharing opt-in. Use a real account to test friend feed. Offline demo never connects to friends.

### 5. Deploy to the existing Vercel project

Use GitHub Desktop → review file changes → **Commit to main** → **Push origin**. The existing connected Vercel project will build the new commit. Your domain's DNS stays untouched. If the build fails, open Vercel → Deployments → Build Logs, fix errors, and push again. If the new version behaves unexpectedly, redeploy the previous successful commit until the issue is resolved.

**Do not publish secret keys or `.env` files**. `VITE_` values end up in compiled client JavaScript, so use publishable Supabase keys only.

## What changed in v1.1

- **Sign-in setup diagnostic:** clearer warning about missing Vercel/Supabase configuration, and support for either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Avatar Studio:** original expressive, Nintendo/Mii-*inspired in simplicity only*, not copied assets. Improved line details for cornrows, locs, natural/curly styles, braids/twists, facial hair, and selectable face shape, eyebrows, earrings, and eye color. Existing avatar JSON fills in new fields with defaults.
- **Atlas:** removed smiley face; anatomy-position anterior/posterior figure. Selected major muscle *regions* use exercise activity counts, not validated strength or muscle tissue imaging.
- **New Tutorial page:** moderate safe resistance, 3×6 repetitions, 15 deep breaths for hold stretches, 5 controlled movement-stretch repetitions, 4/8/4 session structure, rotation, and recovery.
- **Second-workout warning:** after a completed session on the user's local calendar day, a second generated plan triggers a recovery dialog. It is a warning, not an enforced block. Medical conditions may require more individualized advice.
- **Friend activity board:** accepted-friend-only, **explicitly opt-in**, on the Friends page with Refresh. Uses `workouts.completed_at`; does not expose individual weights/sets. Opt in using **Profile → Privacy → Show my completed workouts to friends** and Save.
- **Offline-demo signout:** corrected demo logout when cloud credentials are present.
- **Quick-copy configuration:** `src/config/siteCopy.ts` collects common branding and menu/headline text.

## Anatomy of the whole website: where information flows

```text
Your Excel workbooks (`source/*.xlsx`)
    |  `npm run import:data` (Python script)
    v
Optimized exercise + muscle JSON (`src/data/*.json`)
    |                    Workout generator (`src/lib/planner.ts`)
    |                                  |
    +---------------------------> React screen (`src/App.tsx`)
                                        |
              SVG Avatar / Anatomy / Tutorial components
                                        |
                         State layer (`src/lib/store.tsx`)
                                        |
      Local demo → browser localStorage   OR   Signed-in user → Supabase
                                              |             |
                                       user profiles     workouts/stats
                                              |
                                      accepted friends feed (RPC)

Your local code → GitHub push → Vercel build → deployed static JS/CSS/HTML
                                          |
                      Cloudflare DNS routes onyapo.com to Vercel
                                          |
                   Supabase Auth (Resend SMTP sends confirmation emails)
```

**Cloudflare** is your domain/DNS manager, **Vercel** hosts the website, **GitHub** stores source code, **Supabase** stores accounts/workout progress/friendships, **Resend** delivers verification emails. GitHub can be private while the deployed website remains public.

## Fastest way to make small edits

### Option A — fastest for one word (GitHub browser)

1. Open your private GitHub Onyapo repo on `main`.
2. Navigate to the file, click the pencil **Edit this file**, change the wording and choose **Commit changes** to `main`.
3. Wait for Vercel → **Deployments** to show Ready. Refresh `https://onyapo.com` (use a private browser window if caching is confusing).
4. **Do not make random changes to TypeScript syntax**; for visual/icon changes, VS Code with a local preview is safer. Consider using a branch/preview deployment to review before merging into `main`.

### Option B — best for visual edits (VS Code)

1. Open your existing Onyapo repository locally.
2. Run `npm run dev`; the browser updates automatically as you save a file.
3. Make the change, check mobile size using DevTools, run `npm run build`.
4. GitHub Desktop → Commit → Push; Vercel deploys automatically. Changes are near-immediate *locally*, while production changes take as long as the Vercel build/deploy.

### Cheat sheet: exactly which file to edit

| Want to change | File |
|---|---|
| Menu labels, site name, main page headings | `src/config/siteCopy.ts` |
| A specific paragraph, button wording, section, navigation ICON | `src/App.tsx` (Ctrl/Cmd+F the visible text) |
| Icons | `src/App.tsx`, import from `lucide-react`, replace NAV `icon:Home` or inline `<Home />`; https://lucide.dev/icons |
| Theme colors, fonts, margins, responsive styles | `src/style.css` (CSS custom properties at the beginning) |
| Permanent tutorial health/use text | `src/components/GuidePage.tsx` |
| Signup welcome slides | `src/components/Tutorial.tsx` |
| Facial features, hair drawing, hats/glasses | `src/components/Avatar.tsx` |
| Anatomical body/region drawing | `src/components/AnatomicalBody.tsx` |
| Workout selection rules | `src/lib/planner.ts` |
| Progress, account data, friends and activity feed | `src/lib/store.tsx` plus `supabase/migrations/` |
| Videos added gradually | `scripts/add_video.py` and `src/data/videos.json` |
| Donation and foundation links | `src/data/links.json` |
| Exercise text/muscles | `source/Exercise_Atlas.xlsx`, then `npm run import:data` |

**Typical tiny edit:** Change `workoutHeading: 'Your workout studio'` to another string in `src/config/siteCopy.ts`. Commit it. Vercel deploys; the website's workout heading changes without touching Supabase or Cloudflare.

### When a change needs a database update

- **Text, colors, icons, avatars drawn with SVG, existing exercises:** GitHub push + Vercel deploy only.
- **New account fields or social queries:** create a versioned SQL migration and apply it in your current Supabase project, then push frontend code.
- **Changing Resend:** configure via Supabase SMTP and Cloudflare email DNS, not frontend code.
- **Changing domain:** Vercel Domains + Cloudflare website DNS + Supabase Authentication URL Configuration.

## Smoke test checklist before announcing a release

1. [ ] Vercel latest deployment is Ready and `https://onyapo.com` loads on desktop and mobile.
2. [ ] New confirmed test account can sign up/sign in, and logout works.
3. [ ] Old account's avatar, workouts, and XP remain unchanged.
4. [ ] New avatar styles and face options save and persist across refreshes.
5. [ ] Atlas shows human-like front/back figures without facial decorations.
6. [ ] Tutorial link works on desktop and via mobile hamburger menu.
7. [ ] A completed session triggers the second-workout warning next time that day.
8. [ ] Default activity sharing is **off**; enabling it and completing a workout shows activity only to accepted friends.
9. [ ] Nonfriends cannot read another user's workout JSON or the friends-only feed.
10. [ ] `npm test` and `npm run build` pass in a network-connected development environment.

## Development limitations and safety

This package includes changed code, syntax checks, test instructions, and a migration. A full dependency installation/browser production build was unavailable in the authoring environment because npm registry DNS requests failed. The first real Vercel build and account-level integration test are therefore essential. The app is not a medical device; 3×6 and the 4/8/4 template may need modification for individuals' abilities and goals. Keep a clear privacy policy, account deletion process, and accessibility/safety review before broad public release.
