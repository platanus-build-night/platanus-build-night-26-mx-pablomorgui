import type { Metadata } from 'next';
import { Sora, Manrope } from 'next/font/google';
import './globals.css';

const sora = Sora({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Mundialin - Inteligencia de precios Mundial 2026',
  description: 'Portal de inteligencia de precios para boletos del Mundial 2026',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sora.variable} ${manrope.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
