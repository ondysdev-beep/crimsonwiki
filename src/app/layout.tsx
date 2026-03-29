import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { AdSlot } from '@/components/layout/AdSlot';
import { ClientProviders } from '@/components/layout/ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — The Crimson Desert Community Wiki`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Crimson Desert',
    'Crimson Desert wiki',
    'Crimson Desert guide',
    'Crimson Desert bosses',
    'Crimson Desert quests',
    'Crimson Desert items',
    'Crimson Desert classes',
    'Crimson Desert crafting',
    'Crimson Desert lore',
    'Crimson Desert locations',
    'Crimson Desert tips',
    'Pearl Abyss',
    'MMORPG wiki',
    'game wiki',
  ],
  authors: [{ name: 'CrimsonWiki Community' }],
  creator: 'CrimsonWiki',
  publisher: 'CrimsonWiki',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — The Crimson Desert Community Wiki`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — The Crimson Desert Community Wiki`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#111214" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9218255749368917"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ClientProviders>
          <Navbar />
          <div className="page-outer">
            {/* LEFT AD COLUMN */}
            <div className="ad-col ad-col-left">
              <AdSlot
                slotId="LEFT_AD_SLOT_ID"
                format="vertical"
                style={{ width: 160, height: 600 }}
              />
            </div>

            <div className="page">
              <LeftSidebar />
              <main className="main-content">
                {children}
              </main>
            </div>

            {/* RIGHT AD COLUMN */}
            <div className="ad-col ad-col-right">
              <AdSlot
                slotId="RIGHT_AD_SLOT_ID"
                format="vertical"
                style={{ width: 160, height: 600 }}
              />
            </div>
          </div>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
