# Validation notes

- Imported the two attached workbooks and checked **376 distinct exercise IDs**, **349 distinct muscle names** and **310 home / 66 gym** records.
- Validated every exercise's referenced primary, assisting, stabilizing and stretched muscles against the exact anatomy atlas name list. Passed.
- Transpiled all TypeScript/TSX sources using the system TypeScript compiler to check syntax. Passed (no parse diagnostics).
- Exercised the workout planner in a Node.js functional harness for both modes. Each returned **4 warm-up, 8 strength, 4 cooldown** unique slots, no overlap for isolation target muscles, and correctly transitioned after a prior completed session. Level thresholds tested at 0 / 100 / 500 / 1,500 / 3,000 / 5,000 / 10,000 / 15,000 XP. Passed.
- **Environment limitation:** npm registry DNS is unavailable in the authoring environment. A full `npm install`, `npm test`, `npm run build`, browser visual QA and a live Supabase integration test **could not be completed here**. These must be performed locally or in GitHub Actions before launching the website. Dependencies are declared in `package.json` but not vendored into the ZIP.
- SQL schema and row-level-security rules are provided but were not executed against a live Supabase project. Follow `DEPLOYMENT_GUIDE.md` and test with at least two accounts.

This starter should be considered **a development-ready source repository, not a publicly launched, fully verified production deployment**.
