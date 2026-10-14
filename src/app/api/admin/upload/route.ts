import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase/server';

const OK = /^(image\/(png|jpe?g|webp|gif|svg\+xml)|audio\/(mpeg|mp3|ogg|wav|mp4|aac)|video\/(mp4|webm))$/;

/** يعيد رابط رفع موقّعاً ليرفع المتصفح الملف مباشرة إلى Supabase Storage (يتجاوز حد حجم الطلب في Vercel). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { name, contentType } = (await req.json().catch(() => ({}))) as { name?: string; contentType?: string };
  if (!name || !contentType || !OK.test(contentType)) return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
  const ext = (name.split('.').pop() ?? 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 5);
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const db = supabaseAdmin();
  const { data, error } = await db.storage.from('media').createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'فشل إنشاء الرابط' }, { status: 500 });
  return NextResponse.json({ path, token: data.token, publicUrl: db.storage.from('media').getPublicUrl(path).data.publicUrl });
}
