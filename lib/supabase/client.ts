// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl) {
//   throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
// }

// if (!supabaseAnonKey) {
//   throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//   },
// });

// export default supabase;





import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;