import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace Chat',
  description: 'Your workspace for interacting with advanced AI models. Query documents, write code, and collaborate in real-time.',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'AI Chat Platform Workspace',
            'operatingSystem': 'All',
            'applicationCategory': 'BusinessApplication',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            },
            'description': 'Advanced conversational interface for AI models, providing persistent session states, document parsing, and code compilation options.'
          }).replace(/</g, '\\u003c')
        }}
      />
      {children}
    </>
  );
}
