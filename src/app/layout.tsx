import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
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
    <html lang="zh-TW">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
