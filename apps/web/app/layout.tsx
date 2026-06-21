import { DM_Sans, Geist, JetBrains_Mono, Playfair_Display, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

import './globals.css';

import { AppProviders } from './providers';

/** Plus Jakarta Sans: neutral proportions; Syne was reading as overly wide/stretched at heavy weights. */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

/** Dashboard home (`font-home-*` in globals.css) — Jobclaw app shell. */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata = {
  title: 'Jobclaw — AI portfolio for developers',
  description: 'Connect GitHub and build a job-winning technical profile.',
  icons: {
    icon: '/logo-glyph.png',
    apple: '/logo-glyph.png',
  },
  openGraph: {
    title: 'Jobclaw — AI portfolio for developers',
    description: 'Connect GitHub · run AI assessments · land in the talent directory.',
    url: 'https://www.jobclaw.fyi',
    siteName: 'Jobclaw',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobclaw — AI portfolio for developers',
    description: 'Connect GitHub · run AI assessments · land in the talent directory.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${dmSans.className} ${geist.variable} ${jetbrainsMono.variable} ${playfair.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
