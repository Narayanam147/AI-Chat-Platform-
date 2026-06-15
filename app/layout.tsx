import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-chat.engineer'),
  title: {
    default: 'AI Chat Platform - Next-Gen Conversational Assistant',
    template: '%s | AI Chat Platform'
  },
  description: 'An advanced, lightning-fast ChatGPT alternative featuring multi-modal support, dark mode, persistent search history, and powered by state-of-the-art LLMs.',
  keywords: [
    'AI Chat',
    'AI Assistant',
    'ChatGPT alternative',
    'Conversational AI',
    'LLM Chatbot',
    'AI Chat Platform',
    'Generative AI',
    'AI chat history',
    'developer chatbot'
  ],
  authors: [{ name: 'Narayanam147' }],
  creator: 'Narayanam147',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-chat.engineer',
    siteName: 'AI Chat Platform',
    title: 'AI Chat Platform - Next-Gen Conversational Assistant',
    description: 'An advanced, lightning-fast ChatGPT alternative featuring multi-modal support, dark mode, persistent search history, and powered by state-of-the-art LLMs.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Chat Platform Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat Platform - Next-Gen Conversational Assistant',
    description: 'An advanced, lightning-fast ChatGPT alternative featuring multi-modal support, dark mode, persistent search history, and powered by state-of-the-art LLMs.',
    images: ['/og-image.png'],
    creator: '@ai_chat_engineer'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ai-chat.engineer',
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://ai-chat.engineer/#website',
                  'url': 'https://ai-chat.engineer',
                  'name': 'AI Chat Platform',
                  'description': 'An advanced, lightning-fast ChatGPT alternative.',
                  'publisher': {
                    '@id': 'https://ai-chat.engineer/#organization'
                  },
                  'knowsAbout': [
                    {
                      '@type': 'WebSite',
                      'name': 'PerfectNotes',
                      'url': 'https://perfectnotes.org',
                      'description': 'Free expert-curated technical notes and CS study material.'
                    }
                  ],
                  'potentialAction': [
                    {
                      '@type': 'SearchAction',
                      'target': {
                        '@type': 'EntryPoint',
                        'urlTemplate': 'https://ai-chat.engineer/chat?q={search_term_string}'
                      },
                      'query-input': 'required name=search_term_string'
                    }
                  ]
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://ai-chat.engineer/#organization',
                  'name': 'AI Chat Platform',
                  'url': 'https://ai-chat.engineer',
                  'logo': 'https://ai-chat.engineer/og-image.png',
                  'sameAs': [
                    'https://github.com/Narayanam147/AI-Chat-Platform-'
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className={`bg-white dark:bg-[#131314] ${inter.className}`}>
        <AuthProvider>
          <div className="h-screen w-screen" id="root">
            {children}
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
