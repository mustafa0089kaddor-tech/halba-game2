#!/usr/bin/env node
// يبحث في ويكيميديا كومنز عن صور بترخيص حر ويعرض الترخيص والنسبة الجاهزة للصق في «النسبة والترخيص».
//
//   node scripts/commons-search.mjs "Hejaz railway station Medina"
//   node scripts/commons-search.mjs "Hejaz railway station Medina" --save 2 public/media/hejaz.jpg
//
// راجع الصورة بعينك قبل استخدامها. تأكد أنها تطابق السؤال، وأن الترخيص يسمح بالاستخدام التجاري
// (CC BY وCC BY-SA وCC0 والملك العام مقبولة مع النسبة المطلوبة؛ تجنّب أي ترخيص فيه NC أو ND).
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const query = argv[0];
if (!query) { console.error('اكتب كلمات البحث بالإنجليزية بين علامتي تنصيص'); process.exit(1); }
const si = argv.indexOf('--save');
const saveN = si >= 0 ? Number(argv[si + 1]) : 0;
const savePath = si >= 0 ? argv[si + 2] : '';

const u = new URL('https://commons.wikimedia.org/w/api.php');
Object.entries({ action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '10', gsrsearch: `${query} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1000' }).forEach(([k, v]) => u.searchParams.set(k, v));
const r = await fetch(u, { headers: { 'User-Agent': 'HalbaQuizImageFinder/0.1 (https://example.com; contact@example.com)' } });
if (!r.ok) { console.error('فشل الطلب', r.status); process.exit(1); }
const pages = Object.values((await r.json()).query?.pages ?? {}).sort((a, b) => a.index - b.index);
const strip = (h = '') => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const list = pages.map((p) => {
  const i = p.imageinfo?.[0]; const m = i?.extmetadata ?? {};
  const license = strip(m.LicenseShortName?.value) || 'غير معروف';
  const artist = strip(m.Artist?.value) || 'مجهول';
  return { title: p.title.replace(/^File:/, ''), license, artist, page: i?.descriptionurl, url: i?.thumburl ?? i?.url, w: i?.width, bad: /NC|ND/i.test(license) || license === 'غير معروف' };
});
if (!list.length) { console.log('لا نتائج. جرّب كلمات أخرى.'); process.exit(0); }
list.forEach((x, n) => console.log(`${n + 1}. ${x.title}\n   الترخيص: ${x.license}${x.bad ? '  ⚠️ لا تستخدمها قبل التحقق' : ''}\n   الصفحة: ${x.page}\n   النسبة: الصورة: ${x.artist}، ${x.license}، ويكيميديا كومنز\n`));
if (saveN) {
  const pick = list[saveN - 1];
  if (!pick) { console.error('رقم غير صحيح'); process.exit(1); }
  const img = await fetch(pick.url, { headers: { 'User-Agent': 'HalbaQuizImageFinder/0.1 (contact@example.com)' } });
  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, Buffer.from(await img.arrayBuffer()));
  console.log(`حُفظت في ${savePath}\nانسخ هذه النسبة إلى الحقل «النسبة والترخيص»:\nالصورة: ${pick.artist}، ${pick.license}، ويكيميديا كومنز`);
}
