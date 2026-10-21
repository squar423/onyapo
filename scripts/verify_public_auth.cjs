/**
 * Verify public configuration was embedded into the generated HTML.
 * Only PUBLIC Supabase URL + publishable/anon key are allowed in browser HTML.
 * No environment-variable values or API-key contents are printed.
 * Production builds fail if these values are missing so errors are caught
 * before an unusable site is deployed.
 */
const fs = require('node:fs');
const path = require('node:path');
const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
const production = process.env.VERCEL_ENV === 'production';

function metaValue(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find(t => new RegExp('\\bname=["\\\']' + name + '["\\\']', 'i').test(t));
  if (!tag) return '';
  const content = tag.match(/\bcontent="([^"]*)"/i) || tag.match(/\bcontent='([^']*)'/i);
  return content ? content[1].trim() : '';
}

if (!fs.existsSync(htmlPath)) {
  console.error('[Onyapo auth HTML] Could not find dist/index.html.');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');
const url = metaValue(html, 'onyapo-public-supabase-url');
const key = metaValue(html, 'onyapo-public-supabase-key');
const urlOK = /^https:\/\/[^\s/]+\.supabase\.co\/?$/i.test(url);
const keyOK = Boolean(key) && !/your_|replace_me|paste_key_here|service_role|sb_secret_/i.test(key);
if (urlOK && keyOK) {
  console.log('[Onyapo auth HTML] Verified: public Supabase URL and key are embedded in dist/index.html.');
} else if (production) {
  console.error('[Onyapo auth HTML] Production build BLOCKED: URL present and valid:', urlOK, '; public key valid:', keyOK);
  console.error('[Onyapo auth HTML] Check the two public Supabase environment variables in Vercel.');
  process.exit(1);
} else {
  console.warn('[Onyapo auth HTML] Public auth config not embedded; offline demo only in this non-production build.');
}

// In v1.2.3, the browser login page must display auth-1.2.3. Prior releases
// accidentally updated Vite's HTML injection without updating the actual
// authentication module. Prevent another successful build with that mismatch.
const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
function jsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? jsFiles(p) : entry.isFile() && p.endsWith('.js') ? [p] : [];
  });
}
const bundles = jsFiles(assetsDir);
const hasUpdatedAuth = bundles.some(file =>
  fs.readFileSync(file, 'utf8').includes('auth-1.2.3')
);
if (hasUpdatedAuth) {
  console.log('[Onyapo auth bundle] Verified: browser JS contains auth-1.2.3.');
} else if (production) {
  console.error('[Onyapo auth bundle] Production build BLOCKED: browser JS lacks auth-1.2.3.');
  console.error('[Onyapo auth bundle] Replace src/lib/supabase.ts with the updated version, then commit/push all changes.');
  process.exit(1);
} else {
  console.warn('[Onyapo auth bundle] Browser JS lacks auth-1.2.3; check which version is being built.');
}
