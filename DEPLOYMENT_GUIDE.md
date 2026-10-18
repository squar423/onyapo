# Step-by-step setup, GitHub publication & ongoing updates

This is a **source project**, not a hosted website. Follow the steps to create your own deployment. The React frontend can be hosted as static files; Supabase is required for real verified accounts, friends and cross-device progress tracking.

## 1. Prepare your computer

Install:
- **Git**: https://git-scm.com/downloads
- **Node.js 22 LTS or newer**: https://nodejs.org/en/download
- **Python 3.10 or newer**: https://www.python.org/downloads/
- An editor such as **VS Code**: https://code.visualstudio.com/

Unzip `Onyapo_Website_Project.zip`. Open Terminal / PowerShell in the `onyapo` directory.

```bash
node --version
npm --version
python3 --version        # macOS/Linux; Windows may use `python --version`
npm install
npm run validate:data
npm test
npm run dev
```

Visit the local address displayed by Vite, typically `http://localhost:5173`. Initially, **Explore offline demo** works without configuring any external service. Real account registration should not be represented as working until the Supabase project and email verification are configured.

## 2. Create a GitHub repository

1. Create an account or sign in at https://github.com/.
2. Click **New repository**, name it `onyapo`, set public or private as desired, do **not** initialize with a README (this project has one).
3. In the unzipped project folder run:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Onyapo website"
git remote add origin https://github.com/YOUR_USERNAME/onyapo.git
git push -u origin main
```

If GitHub asks for login, follow its secure browser / credential-manager flow. Do not paste private tokens into repository files. `.env` is git-ignored; `.env.example` is safe to share.

**Important:** `node_modules/` and `dist/` are build outputs, not repository source; `.gitignore` excludes them. Running `npm install` creates `package-lock.json`; **commit that lockfile**, and consider changing Actions jobs from `npm install` to `npm ci` for more reproducible builds after lockfile is committed.

## 3. Set up Supabase accounts and database

1. Create a project at https://supabase.com/dashboard. Choose a database password, safe region and strong security settings.
2. Go to **SQL Editor → New query**, paste the full contents of `supabase/migrations/0001_initial.sql`, and run it. This creates profiles, private progress stats, workout history, friend requests and preset encouragement tables.
3. In **Authentication → Providers → Email**, enable the email provider and **Confirm email**. Verification happens via Supabase's link; until confirmed, users should not be able to sign in with the configured email provider.
4. In **Authentication → URL Configuration**, enter `http://localhost:5173/` as the Site URL for local testing. Add your final production URL to redirect allow-list; update Site URL to production when launching.
5. Find **Project Settings → API**. Copy the **project URL** and **publishable/anon key**. Never use `service_role` / secret API keys in Vite variables or GitHub Actions build vars.
6. Copy `.env.example` to `.env` (never commit `.env`) and fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

7. Restart `npm run dev`, register using an email you control and a test username, open the confirmation email, click the link and sign in.
8. Complete a few practice sets, finish a workout, and verify: `public.profiles`, `public.workouts`, `public.profile_stats` in Supabase Table Editor. The completed workout should be worth **20 XP once**. Friend requests and messages require two confirmed accounts.

**Email delivery:** Supabase starter email sending is rate-limited and intended for testing. For production, configure an external SMTP provider, deliverability (SPF/DKIM/DMARC as appropriate) and suitable privacy/abuse protections. See https://supabase.com/docs/guides/auth/auth-email and https://supabase.com/docs/guides/auth/auth-smtp.

## 4A. Deploy to GitHub Pages (included workflow)

Choose this if you want the same GitHub repo to host the public frontend.

1. GitHub repository → **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Repository **Settings → Secrets and variables → Actions → Variables**. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = **public** anon/publishable key
3. The checked-in `.github/workflows/deploy-pages.yml` builds on pushes to `main`; you can also run it from the **Actions** tab via `workflow_dispatch`.
4. Wait until deployment succeeds. Typical URL: `https://YOUR_USERNAME.github.io/onyapo/`.
5. Add that exact URL to **Supabase Authentication → URL Configuration → Redirect URLs**, and make it the Site URL if it is your canonical site.
6. Test signup, email link return, login, persisted workouts and friend messaging using the deployed URL.

The GitHub workflow sets Vite's `VITE_BASE_PATH` to `/onyapo/` automatically based on repository name. If you use a special `YOUR_USERNAME.github.io` root repository, alter the workflow base to `/`.

**Limitations:** GitHub Pages only hosts the static React build. The Supabase backend and email live separately. GitHub Pages has size/traffic limitations; lots of video files belong on a video platform or CDN, not Pages. A custom domain can be configured in GitHub Pages settings, followed by updating Supabase Auth redirect URLs.

## 4B. Deploy to Vercel (alternative, convenient for custom domains)

1. Sign in at https://vercel.com and **Add New → Project → Import** the GitHub repository.
2. Select Vite as framework (or accept Vercel's detection). Build command `npm run build`; output directory `dist`.
3. In project environment variables, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Do **not** set `VITE_BASE_PATH` (defaults to `/`).
4. Deploy. Add the Vercel URL / custom domain to Supabase Auth Redirect URLs and set the Site URL to production.
5. Test verification email and complete workout flow on a private/test account.

For a Vercel deployment, `.github/workflows/deploy-pages.yml` can be disabled/deleted if Pages is not wanted. You can retain the CI workflow.

## 5. How to edit and update content

### A. Update muscles or exercises from Excel

1. Edit `source/Muscle_Atlas.xlsx` or `source/Exercise_Atlas.xlsx` in Excel/Google Sheets, then save as `.xlsx` back into `source/`.
2. Keep the sheet names exactly **ALL MUSCLES** and **ALL EXERCISES**, with headers on row 3 and records from row 4 onward. Preserve existing **EX#### IDs**. Do not change the meaning or ordering of the 20 exercise columns or 19 muscle columns.
3. Run `npm run import:data`. This updates normalized JSON (the website's fast lookup database). `src/data/videos.json` remains unchanged.
4. Run `npm run validate:data` and `npm test`. The current validation counts are pinned to 376/349; if you intentionally expand the original atlases, update the two expected counts in `scripts/import_atlas.py`, `scripts/validate_data.py`, and the tests and visible UI copy.
5. `git add source src/data scripts tests && git commit -m "Update exercise atlas" && git push`.

**Caution:** The worksheet source is the data authority; do not manually add unsupported anatomical facts or exercise-muscle correlations. Existing records contain anatomy-based mappings, which may not be experimentally validated. Review sources and contraindications when making clinical claims.

### B. Add a new demonstration video

```bash
python3 scripts/add_video.py EX0042 --file './my-new-video.mp4' --caption 'Slow, side-view demonstration'
# Or use an external YouTube video if you have the right to embed it:
python3 scripts/add_video.py EX0042 --youtube 'https://youtu.be/XXXXXXXXXXX'
npm run validate:data
git add public/videos src/data/videos.json
git commit -m "Add EX0042 demonstration"
git push
```

The video filename is linked by ID, so no change is needed to workout logic. Initially unfilled IDs show a placeholder. The site can accumulate videos incrementally. Provide closed captions or transcripts for accessibility.

### C. Add your donation URL and charitable partners

Edit `src/data/links.json`:

```json
{
  "siteDonationUrl": "https://YOUR-CONFIRMED-DONATION-URL",
  "foundations": [
    {"name": "Verified nonprofit name", "url": "https://NONPROFIT-OFFICIAL-DONATE-PAGE", "description": "Optional brief mission"}
  ]
}
```

Only use verified donation URLs with appropriate HTTPS and clear beneficiaries. The starting file has no donation links because none were provided; the site openly states they are pending rather than inventing recipients. Commit and push to publish updates.

### D. Edit styling, icons and page text

- Main theme: `src/style.css`. CSS variables at the top define greens, blues, background, text and borders. Breakpoints are at the end for tablet/mobile.
- Page content: `src/App.tsx` (dashboard, workout, atlas, library, friends, about, profile).
- Onboarding: `src/components/Tutorial.tsx`.
- Avatar: `src/components/Avatar.tsx` and profile selections in `src/App.tsx`.
- Video rendering: `src/components/Video.tsx`.
- Algorithm: `src/lib/planner.ts`, activity-type helpers `src/lib/catalog.ts`.
- XP thresholds: `src/lib/level.ts`.
- Backend logic/RLS: `supabase/migrations/` (**never** casually overwrite production tables or rerun destructive migrations).

## 6. Troubleshooting

| Symptom | What to check |
| --- | --- |
| Registration says cloud is not configured | `.env` keys were omitted/placeholder; restart the dev server; configure Supabase. |
| Confirmation email missing | Spam folder, Supabase Auth logs, provider quotas / SMTP setup. |
| Confirmation link redirects to wrong address | Supabase Auth Site URL / redirect allow list and GitHub repository base path. |
| Progress disappears between devices | You are in **offline demo** mode; verified cloud accounts are needed. |
| Workout save fails | Browser console, Supabase Table Editor, SQL migration, RLS policies and account email confirmation. |
| No video appears | Register an ID in `src/data/videos.json`; ensure file exists or YouTube URL is valid. |
| `npm test` reports missing packages | Run `npm install` with internet access. |
| GitHub Pages build fails | Check Actions logs, repository Pages source, variables and any TypeScript/build errors. |
| XP does not increase | Finish all required sets, keep at least 4 strength exercises; verify RPC was installed. |
| SQL migration errors | Use a fresh project or review existing objects; don't apply blindly to a nonempty live database. |

## 7. Recommended public-launch checklist

- [ ] `npm run validate:data`, `npm test`, `npm run build` all succeed on your machine and in CI.
- [ ] Supabase enabled, **email confirmation tested** and return URLs correct.
- [ ] Tested two independent accounts, friend request, accept/decline, encouragement messages.
- [ ] Tested account separation: one user cannot access another's sessions or XP.
- [ ] Tested mobile Safari, Android Chrome, desktop Chrome/Firefox, touch activation of muscle map, keyboard navigation and text contrast.
- [ ] Add privacy policy, terms, contact info, age eligibility and account/data deletion workflow. Obtain any necessary legal review.
- [ ] Add mechanism for reporting inappropriate usernames/bios or abusive friend connections; optional block/delete friend functionality before large-scale social launch.
- [ ] Evaluate accessibility including keyboard support, reduced motion, subtitles, screen reader labels and responsive layout.
- [ ] Add verified donation pages and foundation URLs, not placeholder payment links.
- [ ] Ensure video permissions/licenses, medical disclaimers, rest/recovery guidance and exercise modifications have been reviewed.
- [ ] Set up Supabase production SMTP, monitoring, security alerts, backups, API quotas and abuse protection.
- [ ] Replace any schematic anatomy views if a clinical-grade anatomical atlas is required. This starter is not one.

## Help / documentation

- GitHub repository setup: https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories
- GitHub Pages Actions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Vite deploy guide: https://vite.dev/guide/static-deploy.html
- Supabase JavaScript: https://supabase.com/docs/reference/javascript/introduction
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

## Updating an existing installation to Onyapo

If your earlier project was already running, you do **not** need a fresh Supabase account or to rerun the initial SQL. Replace the source with this Onyapo version and keep your existing Supabase environment variables.

- **GitHub:** you can leave your original repository name unchanged, or rename it to `onyapo` using GitHub Settings → General → Repository name. The GitHub Pages workflow uses the current repository name to set its base path. If the public URL changes, update the Supabase Site URL and redirect allow-list.
- **Vercel:** you can redeploy the repository under its existing project or rename the Vercel project. Update Supabase redirect URLs if the domain changes.
- **Old accounts, XP, workouts, friends:** retain the same Supabase project. The JSON avatar customization and previous-workout comparison do not need another migration.
- **Offline demo:** old local browser keys can still be read so progress is preserved on the same device and origin; changing to a new domain or browser does not automatically move browser-local demo data. For cross-device storage, use verified Supabase accounts.
- **Validation:** run `npm install`, `npm test`, `npm run validate:data`, and `npm run build` before deploying.

### Previewing the new features

Open **My profile → Avatar Studio**, choose a new hairstyle, glasses, hat, eye shape and expression, then select **Save profile**. Go to **My workout**, complete at least one strength set (recording a weight or band resistance where asked), finish or abandon the session, and generate a later session containing the **same exercise ID**. Under that exercise's sets you'll see your previous recorded metrics.
