import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wissen-Haus - Empowering Young People',
  description: 'Wissen-Haus Empowerment Foundation: Inspiring growth, building capacity, and creating pathways for young people.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Wissen-Haus - Empowering Young People',
    description: 'Wissen-Haus Empowerment Foundation: Inspiring growth, building capacity, and creating pathways for young people.',
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
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3052d5" />
      </head>
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
