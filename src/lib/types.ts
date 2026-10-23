export type QType = 'text' | 'image' | 'audio' | 'video';

export interface Question {
  id: string;
  category_id: string;
  points: 200 | 400 | 600;
  slot: number;
  type: QType;
  question: string;
  answer: string;
  /** الإجابة الصحيحة + ٣ خيارات خاطئة (اختياري). تُستخدم لمساعدة «حذف خيارين» */
  options?: string[] | null;
  media_url?: string | null;
  /** مصدر الحديث أو الآية أو الكتاب، يظهر بعد كشف الإجابة */
  source?: string | null;
  /** سطر النسبة/الترخيص تحت الصورة، مثل: «الصورة: اسم المصوّر، CC BY-SA 4.0، ويكيميديا كومنز» */
  media_credit?: string | null;
  /** free: مرخّصة | own: من إنتاجنا | restricted/null: لا تُعرض */
  media_license?: 'free' | 'own' | 'restricted' | null;
  /** أيقونات تحذير: religious | film | character */
  flags?: string[] | null;
  /** رابط المصدر، يُحوَّل إلى QR بعد كشف الإجابة */
  source_url?: string | null;
}

export interface Sponsor { id: string; name: string; logo_url: string | null; url: string | null; blurb: string | null }

export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  color: string;
  description?: string | null;
  premium: boolean;
  pack_id?: string | null;
  group: string;
  /** مقفلة لهذا المستخدم: لا تُرسل أسئلتها للمتصفح */
  locked: boolean;
  /** عدد الأسئلة المعتمدة في كل مستوى */
  counts: Record<200 | 400 | 600, number>;
  /** جاهزة للعب: ٢ على الأقل في كل مستوى */
  playable: boolean;
  sponsor?: Sponsor | null;
  /** فارغة في قائمة الفئات؛ تُملأ فقط في اللوحة التي تُسحب عند بدء اللعب */
  questions: Question[];
  /** فئة من الكتالوج لا صف لها في قاعدة البيانات، أسئلتها من البنك المحلي */
  bundled?: boolean;
}

export interface Entitlements { userId: string | null; subscriber: boolean; packs: string[]; isAdmin: boolean }

export interface Brand { name: string; logo_url: string | null; color: string | null }

export const SLOT_POINTS = [200, 200, 400, 400, 600, 600] as const;
export const ar = (n: number) => n.toLocaleString('ar-EG');
