'use client';
import Link from 'next/link';
import { useMe } from '@/lib/useMe';

export default function AuthLink() {
  const me = useMe();
  if (!me) return <span className="w-16" />;
  return me.userId ? (
    <Link href="/account" className="rounded-lg bg-tide px-3 py-2 text-sm font-bold hover:bg-reef">حسابي</Link>
  ) : (
    <Link href="/login" className="rounded-lg bg-tide px-3 py-2 text-sm font-bold hover:bg-reef">دخول</Link>
  );
}
