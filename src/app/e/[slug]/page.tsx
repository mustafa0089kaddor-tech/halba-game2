import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlayClient from '@/components/play/PlayClient';
import { getCategories, getEntitlements, getOrg } from '@/lib/data';
import { FREE_DAILY } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false } };

/** نسخة الشركات والفعاليات: رابط خاص بشعار الجهة، ألعاب غير محدودة، بلا إعلانات. */
export default async function OrgPlay({ params }: { params: { slug: string } }) {
  const org = await getOrg(params.slug);
  if (!org) notFound();
  const ent = await getEntitlements();
  const cats = await getCategories({ ...ent, subscriber: false });
  return (
    <PlayClient cats={cats} ent={{ ...ent, subscriber: true }} freeDaily={FREE_DAILY} orgSlug={org.slug} unlimited
      brand={{ name: org.name, logo_url: org.logo_url, color: org.color }} />
  );
}
