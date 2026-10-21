import type { Metadata } from 'next';
import './globals.css';
import { BrandFlowProvider } from '@/context/BrandFlowContext';

export const metadata: Metadata = {
  title: 'BrandFlow — Cloud Brand Management & Marketing Operations SaaS',
  description: 'Centralized operational workspace for multi-brand marketing, content shoots, social posting, creative reviews, and automated handovers.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#F7F9FC] text-[#172033] antialiased">
        <BrandFlowProvider>
          {children}
        </BrandFlowProvider>
      </body>
    </html>
  );
}