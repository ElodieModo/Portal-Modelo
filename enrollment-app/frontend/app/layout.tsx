import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portal Modelo Capoeira',
  description: 'Enrollment portal for Capoeira & Brazilian Culture courses',
  manifest: '/site.webmanifest',
  themeColor: '#061b36',
  icons: {
    icon: '/capoeirista-icon.png',
    apple: '/capoeirista-icon.png',
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
