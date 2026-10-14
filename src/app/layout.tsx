import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Lalezar } from 'next/font/google';
import Link from 'next/link';
import AuthLink from '@/components/AuthLink';
import CookieBanner from '@/components/CookieBanner';
import Logo from '@/components/Logo';
import SwRegister from '@/components/SwRegister';
import { SITE_URL } from '@/lib/env';
import './globals.css';

const display = Lalezar({ subsets: ['arabic', 'latin'], weight: '400', variable: '--font-display' });
const body = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '500', '700'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'حلبة | لعبة أسئلة جماعية بين فريقين', template: '%s | حلبة' },
  description: 'لوحة فئات ونقاط لفريقين يتنافسان: اختاروا الفئات، اكشفوا الأسئلة، واجمعوا النقاط. تعمل على الجوال بدون تحميل.',
  manifest: '/manifest.webmanifest',
  openGraph: { type: 'website', locale: 'ar_AR', siteName: 'حلبة', title: 'حلبة | لعبة أسئلة جماعية بين فريقين', description: 'فريقان، لوحة فئات، وسهرة تحدٍّ كاملة.' },
  icons: { icon: '/icon.svg', apple: '/icon-192.png' },
};
export const viewport: Viewport = { themeColor: '#0A2F3A', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="حلبة - الرئيسية"><Logo /></Link>
          <nav className="flex items-center gap-1 text-sm font-medium sm:gap-3">
            <Link href="/categories" className="rounded-lg px-2 py-2 hover:bg-tide">الفئات</Link>
            <Link href="/pricing" className="rounded-lg px-2 py-2 hover:bg-tide">الاشتراك</Link>
            <AuthLink />
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
        <footer className="border-t border-reef/60 bg-deep">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-4 py-6 text-sm text-paper/70">
            <Link href="/privacy">الخصوصية</Link>
            <Link href="/terms">الشروط</Link>
            <Link href="/cookies">ملفات الارتباط</Link>
            <Link href="/refund">الاسترجاع</Link>
            <Link href="/sponsors">الرعاة</Link>
            <Link href="/business">للشركات والفعاليات</Link>
          </div>
        </footer>
        <CookieBanner />
        <SwRegister />
      </body>
    </html>
  );
}
