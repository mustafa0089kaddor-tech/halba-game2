import 'server-only';
import { getEntitlements } from '@/lib/data';
import { hasAdmin } from '@/lib/env';

/** يعيد true إن كان المستخدم أدمن. كل مسارات الأدمن تمر من هنا. */
export async function isAdmin(): Promise<boolean> {
  if (!hasAdmin) return false;
  return (await getEntitlements()).isAdmin;
}

export const SLOT_PTS = [200, 200, 400, 400, 600, 600];

/** قارئ CSV بسيط يدعم الاقتباس والفواصل داخل الحقول والأسطر المتعددة. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = '', q = false;
  const t = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

/** يستنتج نوع الوسائط من الرابط (للصور والصوت والفيديو ويوتيوب). */
export function inferType(url: string): 'image' | 'audio' | 'video' {
  const u = url.toLowerCase().split('?')[0];
  if (/youtu\.?be/.test(url) || /\.(mp4|webm|mov)$/.test(u)) return 'video';
  if (/\.(mp3|ogg|wav|m4a|aac)$/.test(u)) return 'audio';
  return 'image';
}
