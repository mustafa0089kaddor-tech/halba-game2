/**
 * رمز QR يقود إلى صفحة المصدر (اسم الفيلم، صفحة الشخصية، المرجع).
 * يُعرض بعد كشف الإجابة فقط. لا يُقبل إلا رابط https.
 * ملاحظة: الرمز يُولَّد عبر خدمة خارجية، ولا يُرسل إليها إلا الرابط العام للمصدر.
 */
export default function SourceQr({ url }: { url: string }) {
  let safe = '';
  try { const u = new URL(url); if (u.protocol === 'https:') safe = u.href; } catch { /* رابط غير صالح */ }
  if (!safe) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&data=${encodeURIComponent(safe)}`;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer nofollow" aria-label="فتح صفحة المصدر"
      className="mx-auto inline-flex items-center gap-3 rounded-xl bg-paper p-2 transition hover:opacity-90">
      <img src={src} alt="" width={96} height={96} loading="lazy" className="rounded" />
      <span className="text-3xl" aria-hidden="true">🔗</span>
    </a>
  );
}
