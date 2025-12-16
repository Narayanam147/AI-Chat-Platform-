# Getting Your API Keys - Step by Step Guide

This guide will walk you through getting all the necessary API keys for your AI Chat Platform.

## 🔑 1. Google Gemini API Key (REQUIRED - 5 minutes)

This is the most important key - it powers the AI chat functionality.

### Steps:
1. **Open your browser** and go to: https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Click "Create API Key"** button (usually blue button on the right)

4. **Select "Create API key in new project"** (or use existing project)

5. **Copy the API key** - it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

6. **Open your `.env` file** in the project and replace:
   ```
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   with:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

7. **Save the file**

✅ **Done!** This is the only API key you MUST have to run the app.

---

## 🔐 2. NextAuth Secret (REQUIRED - 1 minute)

This secures your user sessions.

### Steps:
1. **Open PowerShell** (Windows PowerShell)

2. **Run this command**:
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

3. **Copy the output** (random string like: `k7H9mP2qR5tY8wE3nA6sD1fG4jL0xC9v`)

4. **Open `.env` file** and replace:
   ```
   NEXTAUTH_SECRET=change-this-to-a-secure-random-string-min-32-chars
   ```
   with your generated string

5. **Save the file**

✅ **Done!**

---

## 🗄️ 3. MongoDB Connection (REQUIRED - Choose One Option)

You need a database to store users and chats.

### Option A: MongoDB Atlas (Cloud - Recommended, FREE) - 10 minutes

1. **Go to**: https://www.mongodb.com/cloud/atlas

2. **Click "Try Free"** and create account

3. **Create a cluster**:
   - Choose FREE tier (M0 Sandbox)
   - Pick a cloud provider and region close to you
   - Click "Create Cluster"
   - Wait 2-3 minutes for cluster creation

4. **Set up access**:
   - Username: `admin` (or whatever you want)
   - Password: Create a strong password and SAVE IT
   - Click "Create User"

5. **Add your IP address**:
   - Click "Add My Current IP Address"
   - Click "Finish and Close"

6. **Get connection string**:
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/...`)

7. **Update connection string**:
   - Replace `<password>` with your actual password
   - Replace the database name with `ai-chat-platform`
   - Should look like: `mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/ai-chat-platform`

8. **Open `.env` file** and replace:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai-chat-platform
   ```
   with your connection string

9. **Save the file**

✅ **Done!**

### Option B: Local MongoDB (Windows) - 15 minutes

1. **Download MongoDB**:
   - Go to: https://www.mongodb.com/try/download/community
   - Choose Windows version
   - Click Download

2. **Install MongoDB**:
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Click Install

3. **Start MongoDB**:
   - Open PowerShell as Administrator
   - Run: `net start MongoDB`

4. **Keep default in `.env`**:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai-chat-platform
   ```

✅ **Done!**

---

## 🌐 4. Google OAuth (OPTIONAL - 15 minutes)

This allows users to sign in with their Google account.

### Steps:

1. **Go to**: https://console.cloud.google.com/

2. **Create project**:
   - Click "Select a project" → "New Project"
   - Name: "AI Chat Platform"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click and Enable it

4. **Configure OAuth consent screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External"
   - App name: "AI Chat Platform"
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Skip scopes (click "Save and Continue")
   - Add test users: Your email
   - Click "Save and Continue"

5. **Create credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "AI Chat Platform"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

6. **Copy credentials**:
   - Copy "Client ID" (looks like: `123456789-xxxxxxxxxxxxx.apps.googleusercontent.com`)
   - Copy "Client Secret" (looks like: `GOCSPX-xxxxxxxxxxxxx`)

7. **Update `.env` file**:
   ```
   GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
   ```

8. **Save the file**

✅ **Done!**

---

## 📘 5. Facebook OAuth (OPTIONAL - 15 minutes)

This allows users to sign in with Facebook.

### Steps:

1. **Go to**: https://developers.facebook.com/

2. **Create app**:
   - Click "My Apps" → "Create App"
   - Choose "Consumer"
   - Click "Next"
   - App name: "AI Chat Platform"
   - Contact email: Your email
   - Click "Create App"

3. **Add Facebook Login**:
   - Find "Facebook Login" product
   - Click "Set Up"
   - Choose "Web"
   - Site URL: `http://localhost:3000`
   - Click "Save"

4. **Configure OAuth**:
   - Go to Facebook Login → Settings
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
   - Click "Save Changes"

5. **Get credentials**:
   - Go to Settings → Basic
   - Copy "App ID"
   - Click "Show" on App Secret and copy it

6. **Update `.env` file**:
   ```
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

7. **Save the file**

✅ **Done!**

---

## 🔍 6. Google Custom Search (OPTIONAL - 10 minutes)

This enables web search in your AI responses.

### Steps:

1. **Enable Custom Search API**:
   - Go to: https://console.cloud.google.com/
   - Select your project (from Google OAuth setup)
   - Go to "APIs & Services" → "Library"
   - Search "Custom Search API"
   - Click and Enable it

2. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

3. **Create Search Engine**:
   - Go to: https://programmablesearchengine.google.com/
   - Click "Add" or "Get Started"
   - Sites to search: `www.google.com/*`
   - Name: "AI Search"
   - Click "Create"
   - Click "Customize" → "Setup"
   - Enable "Search the entire web"
   - Copy the "Search engine ID"

4. **Update `.env` file**:
   ```
   GOOGLE_SEARCH_API_KEY=your-api-key
   GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
   ```

5. **Save the file**

✅ **Done!**

---

## ✅ Quick Checklist

After completing the setup, your `.env` file should look like this:

```env
# ✅ REQUIRED - Must have these three:
MONGODB_URI=mongodb+srv://... or mongodb://localhost:27017/ai-chat-platform
NEXTAUTH_SECRET=your-generated-32-char-secret
GEMINI_API_KEY=AIzaSy...

# ✅ REQUIRED - Keep default:
NEXTAUTH_URL=http://localhost:3000

# 🔵 OPTIONAL - For Google Sign In:
GOOGLE_CLIENT_ID=123456789-...
GOOGLE_CLIENT_SECRET=GOCSPX-...

# 🔵 OPTIONAL - For Facebook Sign In:
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# 🔵 OPTIONAL - For Web Search:
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
```

## 🚀 Ready to Run!

Once you have at least the REQUIRED items (MongoDB, NextAuth Secret, Gemini API Key), run:

```powershell
cd "d:\ai project"
npm run dev
```

Open: http://localhost:3000

---

## 💡 Tips

- **Save all credentials safely** - you'll need them if you redeploy
- **Don't share your `.env` file** - it contains secrets
- **Free tiers are usually enough** for development and testing
- **OAuth is optional** - users can register with email/password without it
- **Web search is optional** - AI works fine without it

## 🆘 Need Help?

If you get stuck:
1. Check the error message carefully
2. Verify your API keys are correct (no extra spaces)
3. Make sure MongoDB is running
4. Check SETUP.md for troubleshooting
5. Review README.md for detailed documentation

---

Good luck! 🎉
