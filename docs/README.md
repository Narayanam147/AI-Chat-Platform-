# AI Chat Platform 🤖

A modern AI chat platform powered by Google Gemini AI with secure authentication and Supabase database.

## ✨ Features

- **🤖 AI-Powered Chat**: Google Gemini AI integration
- **🔐 Authentication**: Google, Facebook OAuth & Email/Password
- **💾 Data Persistence**: Supabase database
- **📥 Export**: Download chats in multiple formats
- **🎨 Modern UI**: Responsive design with dark mode

## 🛠️ Tech Stack

- **Next.js 14** / **TypeScript** / **Tailwind CSS**
- **NextAuth.js** - Authentication
- **Supabase** - Database
- **Google Gemini API** - AI

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔑 Environment Variables

Create `.env.local`:

```env
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

GEMINI_API_KEY=your-gemini-key

GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_CLIENT_ID=your-facebook-id
FACEBOOK_CLIENT_SECRET=your-facebook-secret
```

## 📄 License

MIT
