import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'X Tweet Scorer',
  description:
    'Analyze how your tweets align with X\'s algorithm. Get engagement scores and actionable recommendations.',
  authors: [{ name: 'X Tweet Scorer' }],
  openGraph: {
    title: 'X Tweet Scorer',
    description:
      'Analyze your tweets against X\'s algorithm for engagement optimization',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
