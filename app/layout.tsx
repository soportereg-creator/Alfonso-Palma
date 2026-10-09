import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INFILE Portal | Consultas Multi-País',
  description: 'Portal de consultas de servicios de facturación electrónica para Panamá, República Dominicana y Costa Rica.',
  keywords: 'INFILE, facturación electrónica, RUC, RNC, Hacienda, DGII, Panamá, Costa Rica, República Dominicana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
