import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-chat.engineer'),
  title: {
    default: 'AI Chat Engineer | ChatGPT Alternative for Developers',
    template: '%s | AI Chat Engineer'
  },
  description: 'The next-gen ChatGPT alternative for developers and coding AI assistant. Built for engineers with low latency, persistent search history, dark mode native, and multi-modal support.',
  keywords: [
    'AI Chat Engineer',
    'ChatGPT alternative for developers',
    'Coding AI Assistant',
    'ChatGPT alternative',
    'Conversational AI',
    'developer chatbot',
    'Groq AI Chat',
    'Llama 3 Chat'
  ],
  authors: [{ name: 'Narayanam147' }],
  creator: 'Narayanam147',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-chat.engineer',
    siteName: 'AI Chat Engineer',
    title: 'AI Chat Engineer | ChatGPT Alternative for Developers',
    description: 'The next-gen ChatGPT alternative for developers and coding AI assistant. Powered by Llama 3 and Groq with low latency.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Chat Engineer Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat Engineer | ChatGPT Alternative for Developers',
    description: 'The next-gen ChatGPT alternative for developers and coding AI assistant. Powered by Llama 3 and Groq with low latency.',
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
                  'name': 'AI Chat Engineer',
                  'description': 'The next-gen ChatGPT alternative for developers and coding AI assistant.',
                  'publisher': {
                    '@id': 'https://ai-chat.engineer/#organization'
                  },
                  'knowsAbout': [
                    {
                      '@type': 'WebSite',
                      'name': 'PerfectNotes',
                      'url': 'https://perfectnotes.org',
                      'description': 'Free expert-curated technical notes and CS study material.'
                    },
                    {
                      '@type': 'WebPage',
                      'name': 'PerfectNotes Engineering Notes',
                      'url': 'https://perfectnotes.org/notes',
                      'description': 'Comprehensive library of B.Tech engineering notes and study material.'
                    },
                    {
                      '@type': 'WebPage',
                      'name': 'PerfectNotes MCQs',
                      'url': 'https://perfectnotes.org/mcq',
                      'description': 'Extensive collection of Multiple Choice Questions for computer science engineering exams.'
                    },
                    {
                      '@type': 'WebPage',
                      'name': 'PerfectNotes Interview Preparation',
                      'url': 'https://perfectnotes.org/interview-questions',
                      'description': 'Technical interview preparation resources, coding questions, and HR interview guides.'
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
                  'name': 'AI Chat Engineer',
                  'url': 'https://ai-chat.engineer',
                  'logo': 'https://ai-chat.engineer/og-image.png',
                  'sameAs': [
                    'https://github.com/Narayanam147/AI-Chat-Platform-'
                  ]
                },
                {
                  '@type': 'SoftwareApplication',
                  '@id': 'https://ai-chat.engineer/#software',
                  'name': 'AI Chat Engineer',
                  'applicationCategory': 'DeveloperApplication',
                  'operatingSystem': 'Web',
                  'offers': {
                    '@type': 'Offer',
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  'featureList': [
                    'Code Generation',
                    'Persistent History',
                    'Dark Mode',
                    'Low Latency LLM'
                  ],
                  'applicationSubCategory': 'AI Coding Assistant',
                  'author': {
                    '@id': 'https://ai-chat.engineer/#organization'
                  }
                }
              ]
            }).replace(/</g, '\\u003c')
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
