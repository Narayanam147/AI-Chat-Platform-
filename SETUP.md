# AI Chat Platform - Setup Guide

## Quick Start Guide 🚀

Follow these steps to get your AI Chat Platform running:

### Step 1: Install MongoDB

**Option A: Local MongoDB (Windows)**
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (FREE tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `MONGODB_URI` in `.env` file

### Step 2: Get Google Gemini API Key (Required)

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste it into `.env` file as `GEMINI_API_KEY=your-key-here`

### Step 3: Set Up Authentication (Optional but Recommended)

#### Generate NextAuth Secret
Run this in PowerShell:
```powershell
$random = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "NEXTAUTH_SECRET=$random"
```
Copy the output to `.env` file

#### Google OAuth (Optional)
1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Secret to `.env` file

#### Facebook OAuth (Optional)
1. Go to: https://developers.facebook.com/
2. Create new app → Consumer
3. Add "Facebook Login" product
4. Settings → Basic: Copy App ID and Secret
5. Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
6. Paste in `.env` file

### Step 4: Google Custom Search (Optional - for Web Search)

1. Go to: https://console.cloud.google.com/
2. Enable "Custom Search API"
3. Create API key
4. Go to: https://programmablesearchengine.google.com/
5. Create new search engine
6. Get Search Engine ID
7. Add both to `.env` file

### Step 5: Run the Application

```powershell
# Make sure you're in the project directory
cd "d:\ai project"

# Start the development server
npm run dev
```

Open browser and go to: http://localhost:3000

### Step 6: Test the Application

1. **Landing Page**: Should see the AI Chat Platform homepage
2. **Sign In**: Click "Sign In" and try:
   - Google Sign In (if configured)
   - Facebook Sign In (if configured)
   - Email/Password (create account first)
3. **Chat**: Start chatting with AI
4. **Export**: Try exporting conversations

## Minimum Required Configuration

To run the app with basic functionality, you ONLY need:

1. ✅ MongoDB connection (local or Atlas)
2. ✅ GEMINI_API_KEY
3. ✅ NEXTAUTH_SECRET

The OAuth providers are optional - users can still register with email/password.

## Configuration Checklist

- [ ] MongoDB installed and running OR MongoDB Atlas connection string
- [ ] Google Gemini API key obtained
- [ ] NextAuth secret generated
- [ ] `.env` file updated with above values
- [ ] Dependencies installed (`npm install`)
- [ ] Application started (`npm run dev`)

## Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service or use MongoDB Atlas

### API Key Error
```
Error: AI service not configured
```
**Solution**: Check `GEMINI_API_KEY` in `.env` file

### OAuth Not Working
**Solution**: OAuth is optional. Use email/password registration instead, or configure OAuth properly with redirect URIs

## Next Steps After Setup

1. **Create Account**: Register with email/password
2. **Start Chatting**: Ask AI anything
3. **Test Web Search**: If configured, AI will include web results
4. **Export Data**: Try exporting conversations
5. **Customize**: Edit colors, themes, AI settings

## Additional Features to Implement

- [ ] File upload for images and documents
- [ ] Better export formats (actual Word/Excel/PDF generation)
- [ ] Chat history sidebar
- [ ] User settings page
- [ ] Rate limiting
- [ ] Advanced AI model selection
- [ ] Multi-language support
- [ ] Voice input/output

## Production Deployment

When ready to deploy:

1. **Frontend**: Deploy to Vercel
   ```powershell
   npm i -g vercel
   vercel
   ```

2. **Database**: Use MongoDB Atlas (already cloud-based)

3. **Environment Variables**: Add all variables to Vercel project settings

4. **Domain**: Update `NEXTAUTH_URL` to your production domain

5. **Security**: Enable all OAuth providers, use strong secrets

## Support

For help:
- Check README.md for detailed documentation
- Review code comments
- Check Next.js documentation: https://nextjs.org/docs
- Check Google Gemini docs: https://ai.google.dev/docs

---

🎉 Happy coding! Your AI Chat Platform is ready to go!
