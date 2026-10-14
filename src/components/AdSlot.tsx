'use client';
import { useEffect, useState } from 'react';
import { getConsent } from '@/lib/consent';
import { useMe } from '@/lib/useMe';

/** إعلان AdSense. لا يظهر إلا بعد: ضبط NEXT_PUBLIC_ADSENSE_CLIENT + موافقة الزائر + أن لا يكون مشتركاً. */
export default function AdSlot({ slot, className = '' }: { slot?: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const me = useMe();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const check = () => setOk(getConsent() === 'granted');
    check();
    window.addEventListener('halba-consent', check);
    return () => window.removeEventListener('halba-consent', check);
  }, []);

  const show = Boolean(client && slot && ok && me && !me.subscriber);
  useEffect(() => {
    if (!show) return;
    if (!document.getElementById('adsbygoogle-js')) {
      const s = document.createElement('script');
      s.id = 'adsbygoogle-js'; s.async = true; s.crossOrigin = 'anonymous';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      document.head.appendChild(s);
    }
    try { ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||= []).push({}); } catch { /* ignore */ }
  }, [show, client]);

  if (!show) return null;
  return (
    <div className={`overflow-hidden rounded-xl ${className}`} aria-label="إعلان">
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
