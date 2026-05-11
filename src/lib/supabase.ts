import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Env variable audit - logs warnings for missing variables
const requiredEnvVars = {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
};

const missingVars = Object.entries(requiredEnvVars).filter(([, v]) => !v).map(([k]) => k);
if (missingVars.length > 0) {
  console.warn(`[WildWings] Missing environment variables: ${missingVars.join(', ')}. Database features will not work.`);
} else {
  console.log('[WildWings] All environment variables configured. Database ready.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
