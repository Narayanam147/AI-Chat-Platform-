# AI Chat Platform 🤖

A modern, full-featured AI chat platform similar to ChatGPT, Gemini, and Perplexity with advanced features including web search, multi-format data export, and secure authentication.

## ✨ Features

- **🤖 AI-Powered Chat**: Integration with Google Gemini AI for intelligent conversations
- **🔍 Web Search**: Real-time data fetching from Google search results
- **📥 Multi-Format Export**: Download conversations in Word, Excel, PDF, and more
- **🔐 Multiple Authentication Methods**:
  - Google OAuth
  - Facebook OAuth
  - Email/Password (with bcrypt encryption)
- **💾 Data Persistence**: MongoDB database for storing user data and chat history
- **🎨 Modern UI**: Beautiful, responsive interface with dark mode support
- **🔒 Security Features**:
  - HTTPS encryption (in production)
  - Secure password hashing
  - Session management with NextAuth
  - Environment variable protection
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **NextAuth.js** - Authentication
- **Lucide React** - Beautiful icons
- **React Markdown** - Rich text rendering

### Backend
- **Node.js** - Runtime environment
- **Next.js API Routes** - Serverless functions
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### AI & APIs
- **Google Gemini API** - AI chat capabilities
- **Google Custom Search API** - Web search integration

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB (local or cloud instance)
- Google Gemini API key
- Google Custom Search API credentials (optional)
- OAuth credentials from Google and Facebook (optional)

## 🚀 Installation

### 1. Clone and Install Dependencies

```powershell
# Navigate to your project directory
cd "d:\ai project"

# Install dependencies
npm install
```

### 2. Install Additional Required Packages

```powershell
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```powershell
copy .env.example .env
```

Edit `.env` file with your credentials:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-chat-platform

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (Get from Facebook Developers)
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Google Gemini AI (Get from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key

# Google Custom Search (optional - for web search)
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### 4. Get API Keys

#### Google Gemini API Key:
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy to `GEMINI_API_KEY` in `.env`

#### Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

#### Facebook OAuth Credentials:
1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and Secret to `.env`

#### Google Custom Search (Optional):
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Custom Search API
3. Create API key
4. Visit [Programmable Search Engine](https://programmablesearchengine.google.com/)
5. Create a search engine and get the ID

#### NextAuth Secret:
Generate a secure secret:
```powershell
# In PowerShell, you can generate a random string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 5. Set Up MongoDB

**Option A: Local MongoDB**
```powershell
# Install MongoDB on Windows
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 6. Run the Application

```powershell
# Development mode
npm run dev

# The app will be available at http://localhost:3000
```

## 📁 Project Structure

```
ai-chat-platform/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth configuration
│   │   ├── chat/
│   │   │   └── route.ts              # Chat API endpoint
│   │   ├── export/
│   │   │   └── route.ts              # Export functionality
│   │   └── register/
│   │       └── route.ts              # User registration
│   ├── chat/
│   │   └── page.tsx                  # Main chat interface
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
├── components/
│   └── providers/
│       └── AuthProvider.tsx          # Session provider
├── lib/
│   └── mongodb.ts                    # Database connection
├── models/
│   ├── User.ts                       # User model
│   └── Chat.ts                       # Chat model
├── .env                              # Environment variables
├── .env.example                      # Example environment file
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
└── next.config.mjs                   # Next.js config
```

## 🎯 Usage

### 1. Sign Up / Login
- Visit `http://localhost:3000`
- Choose authentication method:
  - Google OAuth
  - Facebook OAuth
  - Email/Password

### 2. Chat with AI
- Type your message in the input field
- Press Enter or click Send
- AI will respond with intelligent answers
- Web search results are automatically included (if configured)

### 3. Export Conversations
- Click on export options in the sidebar
- Choose format: Word, Excel, or PDF
- File will be downloaded automatically

### 4. Upload Files (Coming Soon)
- Click the upload button
- Select files (images, documents, etc.)
- AI will analyze and respond

## 🔒 Security Features

### Authentication Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for session management
- Secure HTTP-only cookies
- CSRF protection with NextAuth

### Data Security
- Environment variables for sensitive data
- MongoDB connection with authentication
- Sanitized user inputs
- HTTPS in production (recommended)

### Best Practices
- Never commit `.env` file
- Use strong passwords
- Enable 2FA for OAuth providers
- Regular security updates

## 🚀 Deployment

### Deploy to Vercel (Recommended for Frontend)

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Production
Make sure to add all environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Update `NEXTAUTH_URL` to your production domain

### Database in Production
- Use MongoDB Atlas for production database
- Update `MONGODB_URI` with production connection string
- Enable IP whitelisting in MongoDB Atlas

## 🔧 Configuration

### Customize AI Behavior
Edit `app/api/chat/route.ts`:
```typescript
generationConfig: {
  temperature: 0.7,      // Creativity (0-1)
  topK: 40,             // Sampling parameter
  topP: 0.95,           // Nucleus sampling
  maxOutputTokens: 2048, // Response length
}
```

### Modify Appearance
Edit `tailwind.config.ts` for theme customization
Edit `app/globals.css` for custom styles

## 📝 API Endpoints

### POST `/api/chat`
Send a message to AI
```json
{
  "prompt": "Your question",
  "userId": "user@example.com"
}
```

### POST `/api/export`
Export chat history
```json
{
  "messages": [...],
  "format": "word|excel|pdf",
  "userId": "user@example.com"
}
```

### POST `/api/register`
Register new user
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
# For local installation:
net start MongoDB

# For MongoDB Atlas:
# Check IP whitelist and connection string
```

### API Key Errors
- Verify API keys in `.env` file
- Check API quotas in Google Cloud Console
- Ensure APIs are enabled in Google Cloud

### Build Errors
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for powering the chat
- Next.js team for the amazing framework
- NextAuth.js for authentication
- MongoDB for the database
- All open-source contributors

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

Built with ❤️ using Next.js, TypeScript, and Google Gemini AI
