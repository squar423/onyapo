import {createClient, type SupabaseClient} from '@supabase/supabase-js';

// Injected at build time by vite.config.ts. PUBLIC anon/publishable key only.
// A Vercel deployment must be rebuilt after changing environment variables.
const url=__ONYAPO_PUBLIC_SUPABASE_URL__.trim();
const key=__ONYAPO_PUBLIC_SUPABASE_KEY__.trim();
export const cloudEnabled=Boolean(
  /^https:\/\/[^\s/]+\.supabase\.co\/?$/i.test(url) &&
  key && !key.includes('YOUR_') && !key.startsWith('sb_secret_')
);
export const supabase:SupabaseClient|null=cloudEnabled
  ? createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  : null;
