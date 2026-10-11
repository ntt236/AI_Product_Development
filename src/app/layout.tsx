import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI English Learning Platform',
  description: 'Nền tảng học tiếng Anh thích ứng thông minh (Adaptive AI English Learning Platform)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
