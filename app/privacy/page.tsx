'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {/* Last Updated */}
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last updated: December 19, 2024
          </p>

          {/* 1. Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to AI Chat Platform (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our,&rdquo; or &ldquo;Company&rdquo;). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">2.1 Information You Provide Directly</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Account Information:</strong> When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Profile picture (optional)</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Chat Content:</strong> We collect and store:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Messages you send to the AI</li>
              <li>AI responses</li>
              <li>Chat history and metadata</li>
              <li>Uploaded files and attachments</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Feedback:</strong> If you submit feedback or report issues, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Feedback text</li>
              <li>Screenshots or attachments</li>
              <li>Your contact information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">2.2 Information Collected Automatically</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Usage Data:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Pages visited and time spent on each page</li>
              <li>Features used and interaction patterns</li>
              <li>Search queries and commands used</li>
              <li>Export and download activities</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Device Information:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Device type (mobile, tablet, desktop)</li>
              <li>Operating system and version</li>
              <li>Browser type and version</li>
              <li>IP address</li>
              <li>Language and timezone</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Cookies and Tracking:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Session cookies for authentication</li>
              <li>Preference cookies (theme, language)</li>
              <li>Analytics cookies for usage tracking</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We use the information we collect for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Service Delivery:</strong> Providing, maintaining, and improving the Service</li>
              <li><strong>Personalization:</strong> Customizing your experience based on preferences and activity</li>
              <li><strong>Communication:</strong> Sending you updates, alerts, and responses to your inquiries</li>
              <li><strong>Support:</strong> Providing customer support and responding to feedback</li>
              <li><strong>Analytics:</strong> Analyzing usage patterns to improve features and performance</li>
              <li><strong>Security:</strong> Detecting and preventing fraudulent, unauthorized, or illegal activities</li>
              <li><strong>Compliance:</strong> Complying with legal obligations and enforcing our Terms and Conditions</li>
              <li><strong>Marketing:</strong> Sending promotional emails (with your consent)</li>
            </ul>
          </section>

          {/* 4. Data Storage and Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Storage and Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Storage Location:</strong> Your data is stored on secure servers provided by Supabase. We comply with data protection regulations in your region.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Retention Period:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Account data: Retained while your account is active, deleted 30 days after account deletion</li>
              <li>Chat history: Retained until you delete chats or your account</li>
              <li>Usage logs: Retained for 90 days for analytics and security purposes</li>
              <li>Backup copies: May be retained for up to 1 year for disaster recovery</li>
            </ul>
          </section>

          {/* 5. Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Sharing Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in these circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> Third-party services (Groq API, Google, Facebook) as described in their privacy policies</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights, safety, or property</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or bankruptcy</li>
              <li><strong>Consent:</strong> When you explicitly consent to share specific information</li>
            </ul>
          </section>

          {/* 6. Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Third-Party Services</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our Service integrates with third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Groq API:</strong> For AI responses - see <a href="https://groq.com" className="text-blue-600 dark:text-blue-400 hover:underline">Groq Privacy Policy</a></li>
              <li><strong>Google OAuth:</strong> For authentication - see <a href="https://policies.google.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Google Privacy Policy</a></li>
              <li><strong>Facebook OAuth:</strong> For authentication - see <a href="https://www.facebook.com/privacy/" className="text-blue-600 dark:text-blue-400 hover:underline">Facebook Privacy Policy</a></li>
              <li><strong>NewsAPI:</strong> For news headlines - see <a href="https://newsapi.org/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">NewsAPI Privacy Policy</a></li>
              <li><strong>Google Custom Search:</strong> For web search - see <a href="https://policies.google.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Google Privacy Policy</a></li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              These third parties may collect data as per their own privacy policies. We are not responsible for their practices.
            </p>
          </section>

          {/* 7. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We implement security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Password hashing using bcrypt</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure backup systems</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              However, no system is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          {/* 8. Your Privacy Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Your Privacy Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Access:</strong> Right to access your personal data</li>
              <li><strong>Correction:</strong> Right to correct inaccurate data</li>
              <li><strong>Deletion:</strong> Right to request deletion of your data</li>
              <li><strong>Portability:</strong> Right to export your data</li>
              <li><strong>Opt-out:</strong> Right to opt-out of marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Right to withdraw consent for data processing</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at: <a href="mailto:privacy@ai-chat.enginner" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@ai-chat.enginner</a>
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our Service is not intended for children under 13 years old. We do not knowingly collect personal information from children under 13. If we learn that we have collected information from a child under 13, we will delete it immediately.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For children 13-18, we provide additional privacy protections and recommend parental oversight.
            </p>
          </section>

          {/* 10. California Privacy Rights (CCPA) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to know whether personal information is sold or disclosed</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We do not sell your personal information. To submit a CCPA request, contact: <a href="mailto:privacy@ai-chat.enginner" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@ai-chat.enginner</a>
            </p>
          </section>

          {/* 11. European Privacy Rights (GDPR) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. European Privacy Rights (GDPR)</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you are in the European Union, you have rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with your data protection authority</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Contact us at <a href="mailto:privacy@ai-chat.enginner" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@ai-chat.enginner</a> to exercise your rights.
            </p>
          </section>

          {/* 12. Cookies and Tracking Technologies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>What are Cookies?</strong> Cookies are small files stored on your device that help us remember your preferences and track your activity.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Types of Cookies We Use:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings (theme, language)</li>
              <li><strong>Analytics Cookies:</strong> Track usage to improve our Service</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Manage Cookies:</strong> You can control cookies through your browser settings. Disabling certain cookies may affect functionality.
            </p>
          </section>

          {/* 13. Changes to This Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white font-semibold">AI Chat Platform</p>
              <p className="text-gray-700 dark:text-gray-300">Owner: Narayanam Dubey</p>
              <p className="text-gray-700 dark:text-gray-300">Email: privacy@ai-chat.enginner</p>
              <p className="text-gray-700 dark:text-gray-300">Support: support@ai-chat.enginner</p>
              <p className="text-gray-700 dark:text-gray-300">Website: www.ai-chat.enginner</p>
            </div>
          </section>

          {/* Footer Links */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Related Documents:
            </p>
            <div className="flex gap-4 mt-3 text-sm">
              <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">
                Help Center
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
