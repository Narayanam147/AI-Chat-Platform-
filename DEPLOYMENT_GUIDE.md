# 🚀 Deploy to ai-chat.engineer - Complete Guide

## Step 1: Run Supabase SQL Setup (REQUIRED - Do This First!)

Your Supabase database needs tables before deployment:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/dvtduombjcafksgmusuq
2. **Click "SQL Editor"** (left sidebar)
3. **Click "New Query"**
4. **Copy this SQL and paste it**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),
  image TEXT,
  provider VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Chats Table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow all operations for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for chats" ON chats FOR ALL USING (true);

-- Update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. **Click "Run"** (or press `Ctrl+Enter`)
6. ✅ You should see "Success" message

---

## Step 2: Push Code to GitHub

```powershell
cd "d:\PROJECTS\ai project"

# Add .env to gitignore (security!)
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "node_modules" >> .gitignore
echo ".next" >> .gitignore

# Commit and push
git add .
git commit -m "Ready for deployment with Supabase"
git push origin master
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up/Login to Vercel

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. Click **"Add New"** → **"Project"**
2. Find **"Narayanam147/AI-Chat-Platform-"**
3. Click **"Import"**
4. Keep all default settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Don't click Deploy yet!** → Click **"Environment Variables"** first

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add these (one by one):

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dvtduombjcafksgmusuq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGR1b21iamNhZmtzZ211c3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjU3MzgsImV4cCI6MjA3Nzg0MTczOH0.gDQI38l0nKODh_zpnJHpFbHl6Qby9oIijsJBvcMFF-s` |
| `NEXTAUTH_URL` | `https://ai-chat.engineer` |
| `NEXTAUTH_SECRET` | `IOF3pA9lRnqNEu7mZdPsXzJC06Lwagre` |
| `GEMINI_API_KEY` | `AIzaSyBjYMEe69Y93hrtnc6qfBSTBl6f-LhxDYo` |
| `GOOGLE_CLIENT_ID` | `60949146691-tpv655oukf85jsfjv3mmoj7hrdoqbmta.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |
| `FACEBOOK_CLIENT_ID` | `1343143780022479` |
| `FACEBOOK_CLIENT_SECRET` | `1f0710cac6b787427d3d819673d23bb8` |

**For each variable:**
- Enter the **Name**
- Enter the **Value**
- Select: **Production**, **Preview**, **Development** (check all 3)
- Click **"Add"**

### 3.4 Deploy

1. After adding all variables, click **"Deploy"**
2. Wait 2-3 minutes for deployment to complete
3. You'll get a URL like: `https://ai-chat-platform-xxx.vercel.app`

---

## Step 4: Add Custom Domain (ai-chat.engineer)

### 4.1 Add Domain in Vercel

1. In your Vercel project dashboard
2. Go to **Settings** → **Domains**
3. Click **"Add"**
4. Type: `ai-chat.engineer`
5. Click **"Add"**
6. Also add: `www.ai-chat.engineer` (optional, will redirect)

### 4.2 Configure DNS (At Your Domain Registrar)

Vercel will show you DNS records. Go to where you bought **ai-chat.engineer**:

**Add these DNS records:**

**For Root Domain:**
- **Type**: `A`
- **Name**: `@` (or leave blank)
- **Value**: `76.76.21.21`
- **TTL**: Auto or `3600`

**For WWW:**
- **Type**: `CNAME`
- **Name**: `www`
- **Value**: `cname.vercel-dns.com`
- **TTL**: Auto or `3600`

**Click Save/Update**

### 4.3 Wait for DNS Propagation

- Usually takes 5-15 minutes
- Can take up to 48 hours max
- Check status: https://dnschecker.org

---

## Step 5: Update OAuth Redirect URIs

### Google OAuth:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Click on OAuth 2.0 Client ID
4. **Authorized redirect URIs** → Add:
   - `https://ai-chat.engineer/api/auth/callback/google`
5. Click **Save**

### Facebook OAuth:

1. Go to: https://developers.facebook.com
2. Select your app (ID: 1343143780022479)
3. **Settings** → **Basic** → Add:
   - **App Domains**: `ai-chat.engineer`
4. **Facebook Login** → **Settings** → Add:
   - **Valid OAuth Redirect URIs**: `https://ai-chat.engineer/api/auth/callback/facebook`
5. Click **Save Changes**

---

## Step 6: Verify Deployment

1. Wait for DNS propagation
2. Visit: **https://ai-chat.engineer**
3. Test:
   - ✅ Sign up with email/password
   - ✅ Login with Google
   - ✅ Login with Facebook
   - ✅ Chat with AI
   - ✅ View chat history
   - ✅ Export chat

---

## 🎉 You're Live!

Your AI Chat Platform is now live at:
- **https://ai-chat.engineer**

---

## 🔄 Future Updates

To update your live site:

```powershell
# Make changes locally
# Test at http://localhost:3000

# Push to GitHub
git add .
git commit -m "Your update message"
git push origin master

# Vercel automatically deploys on push!
```

---

## 🆘 Troubleshooting

### "Application error" on Vercel
- Check **Vercel Dashboard** → **Deployments** → **Function Logs**
- Verify all environment variables are set
- Redeploy: **Deployments** → **...** → **Redeploy**

### Domain not working
- Wait 15-60 minutes for DNS
- Verify DNS records are correct
- Clear browser cache (Ctrl+Shift+Delete)
- Test: https://dnschecker.org

### OAuth errors
- Update redirect URIs to use `ai-chat.engineer`
- Check `NEXTAUTH_URL` is set to `https://ai-chat.engineer`

### Database errors
- Make sure you ran the SQL setup in Step 1
- Check Supabase **Table Editor** to see if tables exist
- View **Supabase Logs** for errors

---

## 📊 Monitor Your App

- **Vercel Dashboard**: https://vercel.com/dashboard
  - View analytics
  - Check logs
  - Monitor performance
  
- **Supabase Dashboard**: https://supabase.com/dashboard
  - View database tables
  - Monitor queries
  - Check API usage

---

## 🔒 Security Checklist

- ✅ `.env` files in `.gitignore`
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Environment variables in Vercel (not in code)
- ✅ Supabase Row Level Security enabled
- ✅ OAuth redirect URIs restricted to your domain

---

**Need help?** Check the logs in:
- Vercel: **Deployments** → **Function Logs**
- Supabase: **Logs** (left sidebar)
