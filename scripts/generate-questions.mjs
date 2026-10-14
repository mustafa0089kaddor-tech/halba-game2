#!/usr/bin/env node
// يولّد مسودات أسئلة بالذكاء الاصطناعي إلى ملف CSV جاهز للاستيراد من لوحة الأدمن (تبويب «استيراد CSV»).
// كل ما يُولَّد يدخل بحالة draft ولا يراه اللاعبون إلا بعد أن تراجعه وتعتمده.
//
// أمثلة:
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-questions.mjs --cat nawawi --per-tier 8
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-questions.mjs --group spacetoon --per-tier 8
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-questions.mjs --all --per-tier 8
// خيارات: --out out  --model claude-sonnet-5-5  --batch 8 (عدد الأسئلة في كل طلب لكل مستوى)
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error('ضع المفتاح: ANTHROPIC_API_KEY=... (من console.anthropic.com)'); process.exit(1); }
const MODEL = opt('model', 'claude-sonnet-5-5');
const PER = Number(opt('per-tier', 8));
const OUT = opt('out', 'out');

const { groups, categories } = JSON.parse(fs.readFileSync(new URL('./categories.json', import.meta.url), 'utf8'));
const existing = JSON.parse(fs.readFileSync(new URL('./existing.json', import.meta.url), 'utf8'));
let targets = categories;
if (opt('cat')) targets = categories.filter((c) => c.slug === opt('cat'));
else if (opt('group')) targets = categories.filter((c) => c.group === opt('group'));
else if (!opt('all')) { console.error('حدّد --cat أو --group أو --all'); process.exit(1); }
if (!targets.length) { console.error('لم أجد فئات مطابقة'); process.exit(1); }

const SENSITIVE = new Set(['hadith', 'seerah']);
const groupName = (k) => groups.find((g) => g.key === k)?.name ?? k;

function prompt(cat, avoid) {
  const sensitive = SENSITIVE.has(cat.group) || ['adam-nuh', 'ibrahim', 'musa', 'yusuf', 'isa-maryam', 'other-prophets', 'quran-stories', 'sahaba-stories'].includes(cat.slug);
  return `ألّف ${PER * 3} سؤال مسابقات بالعربية الفصحى المبسّطة للفئة «${cat.name}» ضمن المحور «${groupName(cat.group)}».
المطلوب: ${PER} أسئلة بمستوى 200 (سهل)، و${PER} بمستوى 400 (متوسط)، و${PER} بمستوى 600 (صعب).

القواعد:
- لكل سؤال إجابة صحيحة واحدة قصيرة وغير قابلة للجدل (حتى ست كلمات)، وثلاث إجابات خاطئة معقولة من الفئة نفسها (لا تكون هزلية ولا صحيحة جزئياً).
- حقائق ثابتة ومشهورة ومتفق عليها فقط. إن لم تكن متأكداً 100% من معلومة فلا تكتب سؤالها.
- ألّف الأسئلة بصياغتك. لا تنقل من مواقع أو كتب أسئلة جاهزة، ولا تقتبس كلمات أغانٍ أو نصوصاً محمية بحقوق النشر.
- لا تكرر أي سؤال من القائمة التالية ولا تسأل عن المعلومة نفسها بصياغة أخرى: ${JSON.stringify(avoid.slice(-60))}
- نوّع زوايا الأسئلة (أشخاص، أماكن، أحداث، تواريخ، معاني) ولا تكثر من «من هو» فقط.
${sensitive ? `- هذه فئة دينية حساسة: لا تُدرج إلا ما ثبت في مصادر معتمدة، وللأحاديث لا تذكر إلا المتفق على صحته المشهور، واكتب في حقل source المصدر بدقة (مثل «رواه البخاري» أو «سورة الكهف، الآية ٩» أو اسم الكتاب). تجنّب المسائل الخلافية والمذهبية وأي تواريخ غير محسومة.` : '- إن كانت المعلومة تتعلق بمسلسل أو فيلم أو أنمي فاسأل عن حقائق معروفة عنه (الممثل، المخرج، الشخصية، حدث رئيسي) ولا تخمّن أسماء الدبلجة العربية إن لم تكن متأكداً. اترك source فارغاً إن لم يلزم.'}

- حقل image_query اختياري: إن كانت صورة حقيقية لمكان أو أثر أو شيء ستُغني السؤال، فاكتب كلمات بحث بالإنجليزية للبحث في ويكيميديا كومنز. اتركه فارغاً في الباقي، ولا تقترح أبداً صوراً لشخصيات دينية أو صحابة أو أنبياء، ولا لقطات من أفلام أو مسلسلات أو أنمي.

أعد مصفوفة JSON فقط، بلا شرح ولا علامات كود، بهذا الشكل:
[{"points":200,"question":"...","answer":"...","wrong":["...","...","..."],"source":"","image_query":""}]`;
}

async function ask(text) {
  for (let t = 1; t <= 3; t++) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: text }] }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      const j = await r.json();
      return j.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    } catch (e) { console.error(`  محاولة ${t} فشلت: ${String(e).slice(0, 160)}`); await new Promise((s) => setTimeout(s, 2000 * t)); }
  }
  return '';
}

const norm = (s) => s.replace(/[\u064B-\u0652\u0640]/g, '').replace(/\s+/g, ' ').trim();
const csv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const header = 'category_slug,points,type,question,answer,wrong1,wrong2,wrong3,source,media_url,status,image_query';
const rows = [];
for (const cat of targets) {
  process.stdout.write(`${cat.name} … `);
  const avoid = [...(existing[cat.slug] ?? [])];
  const seen = new Set(avoid.map(norm));
  const raw = await ask(prompt(cat, avoid));
  let list = [];
  try { list = JSON.parse(raw.replace(/^```(?:json)?|```$/gm, '').trim()); } catch { console.log('تعذّر قراءة الرد، تخطّيت'); continue; }
  let kept = 0;
  for (const q of list) {
    const ok = [200, 400, 600].includes(q.points) && q.question && q.answer && Array.isArray(q.wrong) && q.wrong.length === 3
      && q.wrong.every((w) => w && norm(w) !== norm(q.answer)) && new Set(q.wrong.map(norm)).size === 3 && !seen.has(norm(q.question));
    if (!ok) continue;
    seen.add(norm(q.question)); kept++;
    rows.push([cat.slug, q.points, 'text', q.question, q.answer, ...q.wrong, q.source ?? '', '', 'draft', q.image_query ?? ''].map(csv).join(','));
  }
  console.log(`${kept} سؤالاً`);
}
fs.mkdirSync(OUT, { recursive: true });
const label = opt('cat', opt('group', 'all'));
const file = path.join(OUT, `${label}-${new Date().toISOString().slice(0, 10)}.csv`);
fs.writeFileSync(file, '\uFEFF' + [header, ...rows].join('\n') + '\n', 'utf8');
console.log(`\nكُتب ${rows.length} سؤالاً في ${file}\nالخطوة التالية: لوحة الأدمن > استيراد CSV، ثم راجع المسودات من تبويب الأسئلة واعتمدها.`);
