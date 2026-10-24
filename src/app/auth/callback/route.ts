import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  let next = url.searchParams.get('next') ?? '/account';
  if (!next.startsWith('/') || next.startsWith('//')) next = '/account'; // منع إعادة التوجيه لموقع خارجي
  if (code) await supabaseServer().auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(next, url.origin));
}
