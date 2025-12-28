"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-[#131314] dark:to-[#1E1E1E]">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#333537]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-[#333537] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-[#C4C7C5]" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#E3E3E3]">Terms & Conditions</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Last Updated */}
          <p className="text-gray-500 dark:text-[#C4C7C5] mb-8">
            Last updated: December 19, 2024
          </p>

          {/* 1. Agreement to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              By accessing and using the AI Chat Platform ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use the Service.
            </p>
          </section>

          {/* 2. Use License */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">2. Use License</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              We grant you a limited, non-exclusive, revocable license to use the Service for personal, non-commercial purposes. You may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-[#C4C7C5] space-y-2 mb-4">
              <li>Reproduce or copy any content without permission</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Transmit viruses, malware, or any harmful code</li>
              <li>Interfere with the operation of the Service</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Create derivative works based on the Service</li>
            </ul>
          </section>

          {/* 3. User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">3. User Accounts</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              When you create an account, you are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-[#C4C7C5] space-y-2 mb-4">
              <li>Providing accurate and complete information</li>
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-[#C4C7C5] space-y-2 mb-4">
              <li>Harass, threaten, or bully other users</li>
              <li>Post or transmit hateful, abusive, or discriminatory content</li>
              <li>Generate illegal content or help others do so</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Spam or send unsolicited messages</li>
              <li>Impersonate or misrepresent your identity</li>
              <li>Engage in any form of fraud or deception</li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">5. Intellectual Property Rights</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              The Service and all content, features, and functionality (including but not limited to all information, software, code, text, displays, graphics, and interfaces) are the exclusive property of AI Chat Platform and its licensors.
            </p>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              AI-generated responses are provided as-is. You have the right to use responses for your personal use, but not to redistribute or republish them without permission.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL AI CHAT PLATFORM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied.
            </p>
          </section>

          {/* 7. Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">7. Disclaimer</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              While we strive to provide accurate information, the AI may sometimes generate inaccurate, biased, or harmful content. We do not guarantee the accuracy, completeness, or usefulness of any content provided by the Service.
            </p>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              Users are responsible for verifying important information before acting on it.
            </p>
          </section>

          {/* 8. Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">8. Privacy</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              Your use of the Service is also governed by our Privacy Policy. Please review the Privacy Policy to understand our practices regarding the collection and use of your personal information.
            </p>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              By using the Service, you consent to our collection and use of personal information as outlined in the Privacy Policy.
            </p>
          </section>

          {/* 9. User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">9. User Content</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              By submitting content to the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of providing and improving the Service.
            </p>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              You retain all rights to your content and are responsible for ensuring you have the right to share any content you submit.
            </p>
          </section>

          {/* 10. Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">10. Termination</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms and Conditions.
            </p>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed">
              Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          {/* 11. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the Service. Your continued use of the Service after changes constitutes your acceptance of the new Terms and Conditions.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">12. Governing Law</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              These Terms and Conditions are governed by and construed in accordance with the laws of your jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts located in that jurisdiction.
            </p>
          </section>

          {/* 13. Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E3E3E3] mb-4">13. Contact Information</h2>
            <p className="text-gray-700 dark:text-[#C4C7C5] leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-lg">
              <p className="text-gray-900 dark:text-[#E3E3E3] font-semibold">AI Chat Platform</p>
              <p className="text-gray-700 dark:text-[#C4C7C5]">Owner: Narayanam Dubey</p>
              <p className="text-gray-700 dark:text-[#C4C7C5]">Email: <a href="mailto:support@ai-chat.engineer" className="text-blue-600 dark:text-[#8AB4F8] hover:underline hover:text-blue-700 dark:hover:text-[#a3c4fa] transition-colors">support@ai-chat.engineer</a></p>
              <p className="text-gray-700 dark:text-[#C4C7C5]">Website: <a href="https://www.ai-chat.engineer" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-[#8AB4F8] hover:underline hover:text-blue-700 dark:hover:text-[#a3c4fa] transition-colors">www.ai-chat.engineer</a></p>
            </div>
          </section>

          {/* Related Documents */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-[#333537]">
            <p className="text-gray-600 dark:text-[#C4C7C5] text-sm mb-3">Related Documents:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-blue-600 dark:text-[#8AB4F8] hover:underline hover:text-blue-700 dark:hover:text-[#a3c4fa] transition-colors font-medium">
                Privacy Policy
              </Link>
              <Link href="/help" className="text-blue-600 dark:text-[#8AB4F8] hover:underline hover:text-blue-700 dark:hover:text-[#a3c4fa] transition-colors font-medium">
                Help Center
              </Link>
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}


