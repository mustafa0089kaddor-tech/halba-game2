export type Consent = 'granted' | 'denied' | null;
const KEY = 'halba_consent';
export function getConsent(): Consent {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}
export function setConsent(v: 'granted' | 'denied') {
  localStorage.setItem(KEY, v);
  window.dispatchEvent(new Event('halba-consent'));
}
