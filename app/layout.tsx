import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat Platform',
  description: 'ChatGPT-like AI Chat Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() { try { var theme = localStorage.getItem('theme'); if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) { document.documentElement.classList.add('dark'); } } catch (e) {} })();`,
          }}
        />
      </head>
      <body className={`bg-gray-50 ${inter.className}`}>
        <AuthProvider>
          <div className="min-h-screen w-screen" id="root">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
