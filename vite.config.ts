import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Onyapo runs in a browser. Only *public* Supabase credentials are exposed.
 * Supabase/Vercel integrations sometimes name these NEXT_PUBLIC_* or SUPABASE_*.
 * Never inject SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY here.
 */
export default defineConfig(({mode})=>{
  const vars=loadEnv(mode,process.cwd(),'');
  const publicUrl=vars.VITE_SUPABASE_URL || vars.NEXT_PUBLIC_SUPABASE_URL || vars.SUPABASE_URL || '';
  const publicKey=vars.VITE_SUPABASE_ANON_KEY || vars.VITE_SUPABASE_PUBLISHABLE_KEY ||
    vars.NEXT_PUBLIC_SUPABASE_ANON_KEY || vars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    vars.SUPABASE_ANON_KEY || vars.SUPABASE_PUBLISHABLE_KEY || '';
  return {
    plugins:[react()],
    base:vars.VITE_BASE_PATH || '/',
    define:{
      __ONYAPO_PUBLIC_SUPABASE_URL__:JSON.stringify(publicUrl),
      __ONYAPO_PUBLIC_SUPABASE_KEY__:JSON.stringify(publicKey),
    },
  };
});
