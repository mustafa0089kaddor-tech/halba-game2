import type { Metadata } from 'next';
import PlayClient from '@/components/play/PlayClient';
import { getCategories, getEntitlements } from '@/lib/data';
import { FREE_DAILY } from '@/lib/env';

export const metadata: Metadata = { title: 'العب الآن', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function PlayPage({ searchParams }: { searchParams: { cat?: string } }) {
  const ent = await getEntitlements();
  const cats = await getCategories(ent);
  if (!cats.length) return <p className="pt-10 text-center">لا توجد فئات منشورة بعد.</p>;
return <PlayClient cats={cats} ent={ent} freeDaily={9999} initialCat={searchParams.cat} />; })

