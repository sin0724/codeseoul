import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'codeseoul | KOL Mission Platform',
  description: 'Closed KOL matching platform - Seoul HQ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${jetbrainsMono.variable} font-mono antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
