import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import Link from 'next/link';
import AuthLink from '@/components/AuthLink';
import CookieBanner from '@/components/CookieBanner';
import Logo from '@/components/Logo';
import SwRegister from '@/components/SwRegister';
import '@/app/globals.css';

/* خط العناوين والعدّاد وأسماء الفرق والنتائج: Cairo */
const heading = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-heading',
});

/* خط القراءة للأسئلة والخيارات والنصوص التوضيحية: Tajawal */
const body = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-body',
});

// الرابط الرسمي للموقع
const siteUrl = 'https://halba-challenge2.netlify.app';

// صورة Open Graph داخل مجلد public
const ogImageUrl = `${siteUrl}/og.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'حلبة | لعبة أسئلة جماعية بين فريقين',
    template: '%s | حلبة',
  },

  description:
    'لوحة فئات ونقاط لفريقين يتنافسان: اختاروا الفئات، اكشفوا الأسئلة، واجمعوا النقاط. تعمل على الجوال بدون تحميل.',

  manifest: '/manifest.webmanifest',

  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    siteName: 'حلبة',
    url: siteUrl,
    title: 'حلبة | لعبة أسئلة جماعية بين فريقين',
    description: 'فريقان، لوحة فئات، وسهرة تحدٍّ كاملة.',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'حلبة - لعبة أسئلة جماعية بين فريقين',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'حلبة | لعبة أسئلة جماعية بين فريقين',
    description: 'فريقان، لوحة فئات، وسهرة تحدٍّ كاملة.',
    images: [
      {
        url: ogImageUrl,
        alt: 'حلبة - لعبة أسئلة جماعية بين فريقين',
      },
    ],
  },

  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F0A1E',
  width: 'device-width',
  initialScale: 1,
};

const NAV_LINK =
  'rounded-full px-3 py-2 font-heading text-sm font-bold text-paper/80 transition hover:bg-reef/70 hover:text-paper sm:px-4';

const FOOTER_LINKS: [string, string][] = [
  ['/privacy', 'الخصوصية'],
  ['/terms', 'الشروط'],
  ['/cookies', 'ملفات الارتباط'],
  ['/refund', 'الاسترجاع'],
  ['/sponsors', 'الرعاة'],
  ['/business', 'للشركات والفعاليات'],
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen bg-night text-paper antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-saffron focus:px-4 focus:py-2 focus:font-bold focus:text-night"
        >
          تخطَّ إلى المحتوى
        </a>

        <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-night/70 shadow-[0_12px_32px_-18px_rgba(124,58,237,.75)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
            <Link
              href="/"
              aria-label="حلبة - الرئيسية"
              className="rounded-xl transition hover:scale-[1.03]"
            >
              <Logo />
            </Link>
            <nav
              aria-label="التنقل الرئيسي"
              className="flex items-center gap-0.5 sm:gap-1.5"
            >
              <Link href="/categories" className={NAV_LINK}>
                الفئات
              </Link>
              <Link href="/pricing" className={NAV_LINK}>
                الاشتراك
              </Link>
              <AuthLink />
              <Link
                href="/play"
                className="btn btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex"
              >
                ابدأ اللعب
              </Link>
            </nav>
          </div>
          <div
            aria-hidden="true"
            className="h-px bg-gradient-to-l from-transparent via-saffron/40 to-transparent"
          />
        </header>

        <main id="main" className="mx-auto max-w-5xl px-4 pb-16">
          {children}
        </main>

        <footer className="relative mt-4 border-t border-purple-500/20 bg-deep/80 backdrop-blur-md">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-px h-px bg-gradient-to-l from-transparent via-volt/50 to-transparent"
          />
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Logo size={34} />
              <p className="mt-3 max-w-sm text-sm leading-7 text-paper/65">
                فريقان، لوحة فئات، وسهرة تحدٍّ كاملة.
              </p>
            </div>
            <nav
              aria-label="روابط الموقع"
              className="-mx-3 flex flex-wrap gap-1 text-sm text-paper/70"
            >
              {FOOTER_LINKS.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-1.5 transition hover:bg-tide/70 hover:text-saffron"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="border-t border-purple-500/10 px-4 py-4 text-center text-xs text-paper/45">
            © حلبة. جميع الحقوق محفوظة.
          </p>
        </footer>

        <CookieBanner />
        <SwRegister />
      </body>
    </html>
  );
}
