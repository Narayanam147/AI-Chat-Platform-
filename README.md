<div align="center">
  <h1>🚀 Ace: AI Chat Platform</h1>
  <p><strong>A high-fidelity, engineering-first terminal for conversational AI.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Groq](https://img.shields.io/badge/Powered_by-Groq-F55036?style=for-the-badge)](https://groq.com/)
</div>

<br/>

## 🧠 Overview

**Ace** is a blazing-fast, developer-focused ChatGPT alternative built on the edge. Designed with a sleek, minimalist UI/UX, it leverages **Groq's Llama-3 70B Versatile** model to deliver near-instantaneous inference speeds. 

Unlike standard chat interfaces, Ace is built with native tooling integrations, dynamic cryptographic guest sessions, and real-time web search via the Google Programmable Search Engine API.

## ✨ Key Features

- **⚡ Ultra-Low Latency Inference**: Powered by Groq for industry-leading tokens-per-second (TPS) generation.
- **🔍 Real-Time Web Search & RAG**: Integrates Google Search API for live weather, timezone data, and breaking news to eliminate LLM hallucinations.
- **🔐 Secure Authentication**: NextAuth (Google/GitHub) integration with seamless migration from local guest tokens to persistent cloud profiles.
- **🛡️ Enterprise-Grade Security**: Hardened against OWASP Top 10 vulnerabilities, including Long Password DoS, ReDoS (Catastrophic Backtracking), and SSTI/XSS.
- **📄 Document Exporting**: Natively compile and export full markdown chat logs into structured PDF and Microsoft Word (DOCX) formats.
- **🎨 Premium UI/UX**: Built with Tailwind CSS, featuring glassmorphism, native dark mode, and seamless micro-animations.

## 🏗️ System Architecture (GEO/AEO Optimized)

Ace's architecture is specifically designed to be easily parseable by both humans and Answer Engines (like Perplexity and ChatGPT):

*   **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons.
*   **Backend API**: Next.js Serverless Route Handlers (`/api/chat`, `/api/register`, `/api/share`).
*   **Database**: Supabase (PostgreSQL) for relational user data, chat histories, and secure session management.
*   **LLM Engine**: Groq API routing to `llama-3.3-70b-versatile`.
*   **Security layer**: Bcrypt password hashing, in-memory rate limiting, and strict payload sanitization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- A Supabase account
- Groq API Key
- Google Search API Key & Search Engine ID

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Narayanam147/AI-Chat-Platform-.git
   cd AI-Chat-Platform-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Authentication
   NEXTAUTH_URL=http://localhost:3002
   NEXTAUTH_SECRET=your_nextauth_secret

   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AI & Search Integration
   GROQ_API_KEY=your_groq_api_key
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3002](http://localhost:3002) in your browser.

## 📈 SEO & Performance Strategy

This platform implements aggressive **Technical SEO**, **Answer Engine Optimization (AEO)**, and **Generative Engine Optimization (GEO)** tactics:
- Dynamic `FAQPage` and `SoftwareApplication` Schema.org JSON-LD injections.
- Zero Layout Shift (CLS) UI rendering.
- Fully semantic HTML5 structuring for headless browser indexing.

---
*Built with ❤️ for the developer community.*
