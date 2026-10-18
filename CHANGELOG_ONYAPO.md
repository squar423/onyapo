# Onyapo update — October 2026

## Changes

1. Renamed the website and package to **Onyapo**. Branding, navigation, onboarding, About page, documentation, GitHub instructions and browser title reflect the new name.
2. Expanded avatar personalization with **cornrows, short locs, long locs, twists, braids, afro, bun, pixie, and no hair**; **facial hair** (stubble, mustache, goatee, beard); **glasses** (round, square, sunglasses); **hats** (cap, beanie, bucket); **eye shape** (almond, round, wide, relaxed, smiling, wink); and **expression** (smile, neutral, excited, focused, surprised, calm). Existing complexion, hair color, texture, height, width remain.
3. Added **“Last time you did [exercise]”** under every strength exercise with previous date and per-set weight (kg) or band level/count. No false history is shown for a never-performed exercise. Current workout, skipped exercises and unchecked prior sets are excluded.
4. Kept the 376-exercise and 349-muscle source data unchanged. No new database migration is required. Supabase and demo account data are retained. Older saved avatar objects receive new customization defaults; offline demo browser data can be read from legacy keys.
5. Removed npm setup-node caching from GitHub Actions because the starter project does not ship a `package-lock.json`. The lockfile will be generated on the first installation and should be committed.

## How to try the updates

1. `npm install` then `npm run dev` in the `onyapo/` folder.
2. Use **Explore offline demo** or sign in with your configured Supabase account.
3. Open **Profile → Avatar Studio** and make a few selections; click **Save profile**.
4. Open **My workout**, complete a strength exercise while recording kilograms or band strength, then use a future plan with the same movement to view the earlier set amounts. You may need multiple rotations before that exact exercise reappears.

## Testing status

Static TypeScript/JSX parsing passed; the source-data validator passed (376 exercises/349 muscles); and history-selection logic was manually exercised against past, current, and incomplete session scenarios. **A full `npm test` and `npm run build` could not be executed here because the npm registry was not reachable.** Run both locally or through GitHub Actions before deploying publicly.
