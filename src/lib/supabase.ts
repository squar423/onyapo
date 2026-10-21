import {createClient, type SupabaseClient} from '@supabase/supabase-js';

/**
 * Supabase public browser configuration.
 * Vercel build logs already confirmed valid VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY in the production build.
 *
 * The production build inserts two meta tags in index.html using values
 * verified by vite.config.ts. Read those tags FIRST, then fall back to Vite's
 * import.meta.env and the legacy define replacements.
 * Never read or expose Supabase service-role or secret keys.
 */
function publicMeta(name:string):string {
  if (typeof document === 'undefined') return '';
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';
}
const htmlUrl = publicMeta('onyapo-public-supabase-url');
const htmlKey = publicMeta('onyapo-public-supabase-key');

const viteUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const viteAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const vitePublishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

// Vite replaces these constants at build time. The typeof checks also let
// browsers report a useful status if an old build omitted the injected config.
const fallbackUrl = typeof __ONYAPO_PUBLIC_SUPABASE_URL__ === 'string'
  ? __ONYAPO_PUBLIC_SUPABASE_URL__.trim() : '';
const fallbackKey = typeof __ONYAPO_PUBLIC_SUPABASE_KEY__ === 'string'
  ? __ONYAPO_PUBLIC_SUPABASE_KEY__.trim() : '';

const acceptableUrl = (input:string) => /^https:\/\/[^\s/]+\.supabase\.co\/?$/i.test(input);
const acceptableKey = (input:string) => Boolean(input)
  && !/your_|replace_me|paste_key_here/i.test(input)
  && !/sb_secret_|service_role/i.test(input);

// Prefer a valid source over the first nonempty value, so a stale placeholder
// from one source cannot hide a correctly configured second source.
const urls = [
  {name:'Verified HTML public config',value:htmlUrl},
  {name:'Vite public environment',value:viteUrl},
  {name:'Build injection',value:fallbackUrl},
];
const keys = [
  {name:'Verified HTML public config',value:htmlKey},
  {name:'Vite anon key',value:viteAnonKey},
  {name:'Vite publishable key',value:vitePublishableKey},
  {name:'Build injection',value:fallbackKey},
];
const chosenUrl = urls.find(item=>acceptableUrl(item.value));
const chosenKey = keys.find(item=>acceptableKey(item.value));
const url = chosenUrl?.value || '';
const key = chosenKey?.value || '';

export const authBuildStatus = {
  version:'auth-1.2.3',
  urlPresent:urls.some(item=>Boolean(item.value)),
  keyPresent:keys.some(item=>Boolean(item.value)),
  urlValid:Boolean(chosenUrl),
  keyValid:Boolean(chosenKey),
  urlSource:chosenUrl?.name || 'not detected',
  keySource:chosenKey?.name || 'not detected',
} as const;

export const cloudEnabled = Boolean(chosenUrl && chosenKey);
export const supabase:SupabaseClient|null = cloudEnabled
  ? createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  : null;
