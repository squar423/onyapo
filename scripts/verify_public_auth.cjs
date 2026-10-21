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
