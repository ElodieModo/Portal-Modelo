import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portal Modelo Capoeira',
  description: 'Enrollment portal for Capoeira & Brazilian Culture courses',
  manifest: '/site.webmanifest',
  themeColor: '#061b36',
  icons: {
    icon: '/32295424-1BB4-4B01-91BB-84F9FE60FDC1.png',
    apple: '/32295424-1BB4-4B01-91BB-84F9FE60FDC1.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
