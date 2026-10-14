#!/usr/bin/env node
// يرفع كل الصور/الصوت/الفيديو في مجلد دفعة واحدة إلى Supabase Storage (حاوية media)،
// ثم يكتب ملف out/media-urls.csv فيه الرابط العام لكل ملف لتضعه في عمود media_url.
//
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-media.mjs ./my-media
//
// ملاحظة: الحد الافتراضي لحجم الملف في الخطة المجانية 50MB. الأفضل صور أقل من 300KB وفيديو mp4 أقل من 15MB.
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const BASE = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dir || !BASE || !KEY) { console.error('الاستخدام: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-media.mjs <مجلد>'); process.exit(1); }

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const TYPE = (m) => m.startsWith('image') ? 'image' : m.startsWith('audio') ? 'audio' : 'video';
const rows = ['file,url,type'];
for (const f of fs.readdirSync(dir)) {
  const ext = path.extname(f).toLowerCase();
  const mime = MIME[ext];
  if (!mime) { console.log(`تخطّيت ${f} (نوع غير مدعوم)`); continue; }
  const full = path.join(dir, f);
  const size = fs.statSync(full).size;
  if (size > 50 * 1024 * 1024) { console.log(`تخطّيت ${f} (أكبر من 50MB)`); continue; }
  const safe = `bulk/${f.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}`;
  const r = await fetch(`${BASE}/storage/v1/object/media/${safe}`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': mime, 'x-upsert': 'true' }, body: fs.readFileSync(full) });
  if (!r.ok) { console.log(`فشل ${f}: ${r.status} ${(await r.text()).slice(0, 120)}`); continue; }
  const url = `${BASE}/storage/v1/object/public/media/${safe}`;
  rows.push(`"${f}","${url}","${TYPE(mime)}"`);
  console.log(`✔ ${f}  (${Math.round(size / 1024)}KB)`);
}
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/media-urls.csv', '\uFEFF' + rows.join('\n') + '\n', 'utf8');
console.log('\nكُتبت الروابط في out/media-urls.csv. ألصق الرابط في الأدمن (إضافة صورة أو فيديو) أو في عمود media_url عند الاستيراد.');
