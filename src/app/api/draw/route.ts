import { NextResponse } from 'next/server';
import { drawBoard, getEntitlements } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** يسحب لوحة جديدة (٦ أسئلة لكل فئة) مع تفضيل الأسئلة التي لم يرها اللاعب. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { cats?: unknown; seen?: unknown };
  const cats = Array.isArray(b.cats) ? b.cats.filter((x): x is string => typeof x === 'string').slice(0, 7) : [];
  const seen = Array.isArray(b.seen) ? b.seen.filter((x): x is string => typeof x === 'string' && x.length < 50).slice(-1500) : [];
  if (cats.length < 1 || cats.length > 6 || new Set(cats).size !== cats.length) return NextResponse.json({ error: 'اختيار الفئات غير صالح' }, { status: 400 });
  const board = await drawBoard(await getEntitlements(), cats, seen);
  if (!board.length) return NextResponse.json({ error: 'إحدى الفئات غير متاحة' }, { status: 403 });
  return NextResponse.json({ board });
}
