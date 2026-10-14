'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getConsent, setConsent } from '@/lib/consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(getConsent() === null), []);
  if (!show) return null;
  const choose = (v: 'granted' | 'denied') => { setConsent(v); setShow(false); };
  return (
    <div role="dialog" aria-label="ملفات تعريف الارتباط" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-reef bg-deep p-4 shadow-2xl">
      <p className="text-sm leading-7">
        نستخدم ملفات ضرورية لتشغيل الموقع، وملفات إعلانية اختيارية لعرض الإعلانات. اختيارك لا يمنعك من اللعب.{' '}
        <Link href="/cookies" className="text-saffron underline">التفاصيل</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary flex-1 !py-2" onClick={() => choose('granted')}>أوافق على الكل</button>
        <button className="btn btn-ghost flex-1 !py-2" onClick={() => choose('denied')}>الضرورية فقط</button>
      </div>
    </div>
  );
}
