import {createClient, type SupabaseClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cloudEnabled=Boolean(url && key && /^https:\/\/[^/]+/i.test(url) && !key.includes('YOUR_'));
export const supabase:SupabaseClient|null=cloudEnabled?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
