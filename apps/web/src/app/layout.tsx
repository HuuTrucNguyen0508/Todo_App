import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cursor Todo',
  description: 'A modern todo app with full observability',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          {children}
        </div>
      </body>
    </html>
  );
}
