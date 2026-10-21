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
  const keyAllowed=keyPresent && !/your_|replace_me|paste_key_here|service_role|sb_secret_/i.test(publicKey);
  if (process.env.VERCEL) {
    console.info('[Onyapo auth diagnostics] Deployment environment:',process.env.VERCEL_ENV || '(unknown)');
    console.info('[Onyapo auth diagnostics] Supabase URL variable:',selectedUrlName,'; standard URL valid:',urlValid);
    console.info('[Onyapo auth diagnostics] Supabase public-key variable:',selectedKeyName,'; public key passes basic checks:',keyAllowed);
    console.info('[Onyapo auth diagnostics] Credentials are', urlValid && keyAllowed ? 'available to build (not yet tested with Supabase)' : 'missing/invalid for this build');
  }
  // Vite 6 did not reliably expose the values to Onyapo's browser bundle
  // despite confirming that they were available to this build. Embed the PUBLIC
  // URL and publishable/anon key in index.html as a separate, verifiable path.
  // These are client-public values; never embed secret or service-role keys.
  const browserUrl=urlValid ? publicUrl.trim() : '';
  const browserKey=keyAllowed ? publicKey.trim() : '';
  return {
    plugins:[
      react(),
      {
        name:'onyapo-public-auth-html',
        transformIndexHtml(){
          return [
            {tag:'meta',attrs:{name:'onyapo-public-supabase-url',content:browserUrl},injectTo:'head' as const},
            {tag:'meta',attrs:{name:'onyapo-public-supabase-key',content:browserKey},injectTo:'head' as const},
          ];
        },
      },
    ],
    base:vars.VITE_BASE_PATH || '/',
    define:{
      __ONYAPO_PUBLIC_SUPABASE_URL__:JSON.stringify(browserUrl),
      __ONYAPO_PUBLIC_SUPABASE_KEY__:JSON.stringify(browserKey),
    },
  };
});
