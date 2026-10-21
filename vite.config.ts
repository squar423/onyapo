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

  // Build-time diagnostics: print only variable NAMES and validation outcomes.
  // Never log the full URL, public key, or any other environment-variable value.
  const urlNames=['VITE_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_URL'] as const;
  const keyNames=['VITE_SUPABASE_ANON_KEY','VITE_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEY'] as const;
  const selectedUrlName=urlNames.find(name=>Boolean(vars[name])) || '(not found)';
  const selectedKeyName=keyNames.find(name=>Boolean(vars[name])) || '(not found)';
  const urlValid=/^https:\/\/[^\s/]+\.supabase\.co\/?$/i.test(publicUrl.trim());
  const keyPresent=Boolean(publicKey.trim());
  const keyAllowed=keyPresent && !publicKey.includes('YOUR_') && !publicKey.trim().startsWith('sb_secret_');
  if (process.env.VERCEL) {
    console.info('[Onyapo auth diagnostics] Deployment environment:',process.env.VERCEL_ENV || '(unknown)');
    console.info('[Onyapo auth diagnostics] Supabase URL variable:',selectedUrlName,'; standard URL valid:',urlValid);
    console.info('[Onyapo auth diagnostics] Supabase public-key variable:',selectedKeyName,'; public key passes basic checks:',keyAllowed);
    console.info('[Onyapo auth diagnostics] Credentials are', urlValid && keyAllowed ? 'available to build (not yet tested with Supabase)' : 'missing/invalid for this build');
  }
  return {
    plugins:[react()],
    base:vars.VITE_BASE_PATH || '/',
    define:{
      __ONYAPO_PUBLIC_SUPABASE_URL__:JSON.stringify(publicUrl),
      __ONYAPO_PUBLIC_SUPABASE_KEY__:JSON.stringify(publicKey),
    },
  };
});
