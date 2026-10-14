'use client';
import { useEffect, useState } from 'react';

export interface Me { userId: string | null; email: string | null; subscriber: boolean; isAdmin: boolean }
let cache: Promise<Me> | null = null;

export function useMe(): Me | null {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    cache ??= fetch('/api/me').then((r) => r.json()).catch(() => ({ userId: null, email: null, subscriber: false, isAdmin: false }));
    cache.then(setMe);
  }, []);
  return me;
}
