import Link from 'next/link';
import { Sparkles, FileText, ArrowRight, Terminal, Globe, Cpu, Zap, Code2, Heart, Shield } from 'lucide-react';

export default function Home() {
  const faqs = [
    {
      question: "What is Ace?",
      answer: "Ace is a high-performance, developer-focused conversational interface that matches ChatGPT's ease of use while offering native tooling integrations, dynamic guest session structures, and multi-format document exporting."
    },
    {
      question: "How do guest sessions migrate to permanent profiles?",
      answer: "When you access the workspace as a guest, a secure session token is registered locally on your device. Once you sign up via NextAuth (Google/GitHub), all local chat histories, configuration states, and settings automatically migrate to your cloud profile."
    },
    {
      question: "What formats are supported for conversation exporting?",
      answer: "You can compile and export full markdown chat logs into structured PDF and Microsoft Word DOCX formats. The exports are parsed server-side to guarantee exact typography and structure."
    },
    {
      question: "Are there developer APIs built into the workspace?",
      answer: "Yes, the platform includes built-in endpoints for developers, including /api/timezone for temporal conversions and /api/weather for local climatic data fetching, designed to showcase conversational agent tooling."
    },
    {
      question: "How does Ace ensure data privacy and security?",
      answer: "Ace implements robust server-side security measures including bcrypt password hashing, in-memory rate limiting against brute force attacks, and comprehensive sanitization to prevent XSS and catastrophic backtracking (ReDoS) vulnerabilities."
    },
    {
      question: "What language models power the Ace conversational engine?",
      answer: "Ace leverages Groq's ultra-low latency inference engine, specifically utilizing Llama 3 70B Versatile, to provide lightning-fast, high-quality responses that rival state-of-the-art models like GPT-4 and Claude 3.5 Sonnet."
    },
    {
      question: "Does Ace support real-time web search integration?",
      answer: "Absolutely. Ace natively integrates with the Google Programmable Search Engine API to fetch real-time weather, timezone data, and live news headlines, feeding verified context directly into the LLM's prompt window to eliminate hallucinations."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-[#131314] dark:text-[#E3E3E3] transition-colors duration-200 overflow-x-hidden w-full">
      {/* FAQ Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': faqs.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          })
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-slate-50/80 backdrop-blur-md dark:border-[#333537]/60 dark:bg-[#131314]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-semibold text-2xl tracking-tight text-slate-950 dark:text-white">
              Ace
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-650 dark:text-[#C4C7C5]">
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors">Features</a>
            <a href="#developers" className="hover:text-slate-950 dark:hover:text-white transition-colors">API</a>
            <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">FAQ</a>
            <a href="https://perfectnotes.org" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors flex items-center gap-1">
              CS Notes <Globe className="h-3 w-3 text-emerald-500" />
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/chat"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all duration-150 shadow-sm"
            >
              Open Console
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center border-b border-slate-200/60 dark:border-[#333537]/60">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333537]/85 text-xs font-medium text-slate-700 dark:text-[#C4C7C5] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-[#8AB4F8]" />
              <span>Version 1.0 Production Ready</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-[1.1] mb-6 font-sans">
              High-fidelity terminal for conversational AI.
            </h1>

            <p className="text-base sm:text-lg text-slate-650 dark:text-[#C4C7C5] mb-8 max-w-xl leading-relaxed">
              An engineering-first workspace built for speed. Query advanced models, manage cryptographic guest tokens, compile developer API weather tasks, and export structured document layouts natively.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link 
                href="/chat"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all shadow-sm"
              >
                Launch App Console
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <a 
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#333537] bg-white dark:bg-[#1E1E1E] hover:bg-slate-50 dark:hover:bg-[#333537] px-6 py-3.5 text-sm font-medium text-slate-600 dark:text-[#E3E3E3] transition-all shadow-xs"
              >
                View Architecture
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-slate-200/50 dark:border-[#333537]/50 w-full">
              <div>
                <p className="text-2xl font-bold text-slate-950 dark:text-white">99.9%</p>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-1 uppercase tracking-wider">Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950 dark:text-white">&lt; 35ms</p>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-1 uppercase tracking-wider">Latency</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950 dark:text-white">100%</p>
                <p className="text-xs text-slate-500 dark:text-[#C4C7C5] mt-1 uppercase tracking-wider">Guest-Owned</p>
              </div>
            </div>
          </div>

          {/* Premium UI/UX Mock Chat Component */}
          <div className="lg:col-span-6 relative w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[520px] rounded-xl border border-slate-200 dark:border-[#333537]/80 bg-white dark:bg-[#1E1E1E] shadow-md dark:shadow-2xl overflow-hidden font-sans">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1E1E1E] flex items-center justify-between bg-slate-50/50 dark:bg-[#131314]/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="text-xs font-mono text-slate-450 dark:text-[#C4C7C5]/70">console://ace.workspace</div>
                <div className="w-4 h-4" />
              </div>
              {/* Messages Area */}
              <div className="p-4 space-y-4 min-h-[300px] text-sm">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-[#8AB4F8] flex items-center justify-center font-bold text-xs">U</div>
                  <div className="flex-1 bg-slate-50 dark:bg-[#131314]/50 p-3 rounded-lg border border-slate-100 dark:border-[#1E1E1E] text-slate-700 dark:text-[#C4C7C5]">
                    How do I format structural code blocks and check current local timezone API?
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs"><Cpu className="w-3.5 h-3.5" /></div>
                  <div className="flex-1 space-y-3">
                    <p className="text-slate-800 dark:text-zinc-200">Here is the API response schema for the weather integrations:</p>
                    <pre className="p-2.5 rounded-md bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-[#1E1E1E]">
{`{
  "status": "success",
  "data": {
    "timezone": "America/New_York",
    "gmtOffset": -5
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
              {/* Input Area */}
              <div className="p-3 border-t border-slate-100 dark:border-[#1E1E1E] bg-slate-50/50 dark:bg-[#131314]/20 flex gap-2">
                <div className="flex-1 h-9 bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-200 dark:border-[#333537] flex items-center px-3 text-xs text-slate-400 dark:text-[#C4C7C5]/70">
                  Ask anything...
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-200/60 dark:border-[#333537]/60">
          <div className="text-left max-w-3xl mb-16">
            <h2 className="text-xs font-semibold text-blue-600 dark:text-[#8AB4F8] uppercase tracking-wider mb-2">Core Architecture</h2>
            <p className="text-3xl font-bold text-slate-950 dark:text-white tracking-tight">Engineered for absolute performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Guest token */}
            <div className="md:col-span-2 p-8 rounded-xl border border-slate-200 dark:border-[#333537] bg-white dark:bg-[#1E1E1E] hover:border-slate-350 dark:hover:border-[#333537] transition-all flex flex-col justify-between min-h-[220px]">
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-[#131314] flex items-center justify-center text-slate-950 dark:text-white mb-4 border border-slate-200/60 dark:border-[#333537]/80">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">Supabase Guest Token Migration</h3>
                <p className="text-sm text-slate-500 dark:text-[#C4C7C5] leading-relaxed max-w-lg font-sans">
                  Initiate chat workspaces with zero sign-up friction. Cryptographic session tokens are generated on Supabase and cached locally, migrating historical assets to permanent profiles securely.
                </p>
              </div>
            </div>

            {/* Feature 2 - Exports */}
            <div className="p-8 rounded-xl border border-slate-200 dark:border-[#333537] bg-white dark:bg-[#1E1E1E] hover:border-slate-350 dark:hover:border-[#333537] transition-all flex flex-col justify-between min-h-[220px]">
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-[#131314] flex items-center justify-center text-slate-950 dark:text-white mb-4 border border-slate-200/60 dark:border-[#333537]/80">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">Structured Document Exports</h3>
                <p className="text-sm text-slate-500 dark:text-[#C4C7C5] leading-relaxed">
                  Compile fully formatted Markdown conversations directly into print-ready PDF structures or clean Microsoft Word DOCX formats.
                </p>
              </div>
            </div>

            {/* Feature 3 - Share Links */}
            <div className="p-8 rounded-xl border border-slate-200 dark:border-[#333537] bg-white dark:bg-[#1E1E1E] hover:border-slate-350 dark:hover:border-[#333537] transition-all flex flex-col justify-between min-h-[220px]">
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-[#131314] flex items-center justify-center text-slate-950 dark:text-white mb-4 border border-slate-200/60 dark:border-[#333537]/80">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">Dynamic Share Links</h3>
                <p className="text-sm text-slate-500 dark:text-[#C4C7C5] leading-relaxed">
                  Generate instant, public-facing preview pages of selected chats, formatted using fully compliant SEO metadata tags.
                </p>
              </div>
            </div>

            {/* Feature 4 - System APIs */}
            <div className="md:col-span-2 p-8 rounded-xl border border-slate-200 dark:border-[#333537] bg-white dark:bg-[#1E1E1E] hover:border-slate-350 dark:hover:border-[#333537] transition-all flex flex-col justify-between min-h-[220px]">
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-[#131314] flex items-center justify-center text-slate-950 dark:text-white mb-4 border border-slate-200/60 dark:border-[#333537]/80">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">Built-in API Tools Integration</h3>
                <p className="text-sm text-slate-500 dark:text-[#C4C7C5] leading-relaxed max-w-lg">
                  Showcases robust tool-calling schemas via local routes. Integrated API functions enable conversational systems to request physical weather conditions and timezones cleanly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Documentation Section */}
        <section id="developers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-200/60 dark:border-[#333537]/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-left">
              <h2 className="text-xs font-semibold text-blue-600 dark:text-[#8AB4F8] uppercase tracking-wider mb-2">Developer Tools</h2>
              <h3 className="text-3xl font-bold text-slate-950 dark:text-white tracking-tight mb-6">Integrate system-level features directly.</h3>
              <p className="text-sm text-slate-655 dark:text-[#C4C7C5] mb-6 leading-relaxed">
                We expose API endpoints designed for tooling demonstrations. You can retrieve temporal zone offset states or structured location climate objects instantly.
              </p>
              <ul className="space-y-3.5 text-sm font-medium text-slate-755 dark:text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Code2 className="h-4 w-4 text-slate-950 dark:text-white" />
                  <span>REST API compliant structured endpoints</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-4 w-4 text-slate-950 dark:text-white" />
                  <span>Sub-millisecond processing latency</span>
                </li>
              </ul>
            </div>
            
            {/* Code Snippet Box */}
            <div className="lg:col-span-7 w-full">
              <div className="rounded-xl border border-slate-200 dark:border-[#333537] bg-[#0d0e12] overflow-hidden text-left shadow-lg">
                <div className="px-4 py-3 bg-[#13141b] border-b border-[#333537] flex items-center justify-between text-xs text-[#C4C7C5] font-mono">
                  <span>GET /api/timezone</span>
                  <span className="text-emerald-500">cURL</span>
                </div>
                <div className="p-5 font-mono text-xs sm:text-sm overflow-x-auto text-zinc-300 space-y-4">
                  <div>
                    <span className="text-[#C4C7C5]/70"># Fetch current localized timezone mapping</span>
                    <p className="text-[#89DDFF] mt-1">
                      curl <span className="text-[#C3E88D]">&quot;https://ai-chat.engineer/api/timezone&quot;</span>
                    </p>
                  </div>
                  <div className="border-t border-[#333537]/80 pt-4">
                    <span className="text-[#C4C7C5]/70"># Response Object</span>
                    <pre className="text-[#A6ACCD] mt-1.5">
{`{
  "status": "success",
  "data": {
    "timezone": "America/Los_Angeles",
    "gmtOffset": -8,
    "formatted": "2026-06-15 08:31:53"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Semantic FAQ Section for AEO / GEO */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-slate-200/60 dark:border-[#333537]/60">
          <div className="text-left mb-12">
            <h2 className="text-xs font-semibold text-blue-600 dark:text-[#8AB4F8] uppercase tracking-wider mb-2">AEO Knowledge</h2>
            <p className="text-3xl font-bold text-slate-950 dark:text-white tracking-tight">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className="group border border-slate-200 dark:border-[#333537] rounded-xl bg-white dark:bg-[#1E1E1E] p-5 [&_summary::-webkit-details-marker]:hidden transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <span className="text-base font-semibold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#8AB4F8] transition-colors">
                    {faq.question}
                  </span>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-slate-100 dark:bg-[#131314] p-1 text-slate-600 dark:text-[#C4C7C5] group-open:rotate-180 transition-transform duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="mt-4 border-t border-slate-100 dark:border-[#1E1E1E] pt-4">
                  <p className="text-sm text-slate-650 dark:text-[#C4C7C5] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="relative rounded-2xl bg-[#1E1E1E] text-white overflow-hidden py-16 px-6 sm:px-12 border border-[#333537]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Elevate your developer chat logs.
              </h2>
              <p className="text-sm text-[#C4C7C5] leading-relaxed max-w-lg mx-auto">
                No configurations needed. Try immediate guest token generation or plug in your credentials to deploy persistent conversation streams.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                <Link 
                  href="/chat"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-white text-slate-950 px-6 py-3.5 text-sm font-semibold hover:bg-slate-100 transition-all"
                >
                  Start Chatting Now
                </Link>
                <a 
                  href="https://perfectnotes.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-[#333537] hover:bg-[#1E1E1E]/60 px-6 py-3.5 text-sm font-semibold text-[#E3E3E3] transition-all gap-1.5"
                >
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Visit CS Notes Library
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#333537] bg-slate-50 dark:bg-[#131314] py-12 text-xs text-slate-500 dark:text-[#C4C7C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="space-y-3">
              <p className="font-semibold text-slate-950 dark:text-white">Platform</p>
              <ul className="space-y-2">
                <li><Link href="/chat" className="hover:text-slate-950 dark:hover:text-white transition-colors">Workspace</Link></li>
                <li><a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors">Architecture</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-slate-950 dark:text-white">Developers</p>
              <ul className="space-y-2">
                <li><a href="#developers" className="hover:text-slate-950 dark:hover:text-white transition-colors">REST API Docs</a></li>
                <li><a href="https://github.com/Narayanam147/AI-Chat-Platform-" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors">Source Code</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-slate-950 dark:text-white">Legal</p>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-slate-950 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-950 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-slate-950 dark:text-white">External Library</p>
              <p className="text-slate-400 dark:text-[#C4C7C5]/70 leading-normal">
                Looking for computer science exam preparation? Check out our partner project.
              </p>
              <a 
                href="https://perfectnotes.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-450 hover:underline font-medium"
              >
                Get Free Study Materials <Globe className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="border-t border-slate-200/60 dark:border-[#333537]/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} ai-chat.engineer. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-sans">
              Built with <Heart className="h-3.5 w-3.5 text-red-500 fill-current" /> for the engineering community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
