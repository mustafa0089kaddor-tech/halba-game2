export const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const hasAdmin = hasSupabase && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com';
export const FREE_DAILY = Number(process.env.NEXT_PUBLIC_FREE_DAILY_GAMES ?? 3);
