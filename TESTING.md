# Testing & Debugging Guide

Complete guide for testing and debugging the AI Chat Platform.

---

## 🧪 Testing Checklist

### 1. Local Environment Tests

#### Prerequisites Check
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB running or Atlas connection configured
- [ ] All environment variables set in `.env`
- [ ] Dependencies installed (`npm install`)

#### Build Test
```bash
# Test if project builds successfully
npm run build

# Expected: Build completes without errors
```

#### Development Server Test
```bash
# Start development server
npm run dev

# Expected: Server starts on http://localhost:3000
```

---

### 2. Authentication Tests

#### Email/Password Registration
1. Go to http://localhost:3000
2. Click "Sign in with Email"
3. Try to register a new account
4. Verify email is stored in MongoDB
5. Test login with same credentials

**Expected Results:**
- ✅ Registration creates user in database
- ✅ Password is hashed (not plain text)
- ✅ Login redirects to /chat
- ✅ Session persists on refresh

#### Google OAuth (if configured)
1. Click "Continue with Google"
2. Complete Google sign-in flow
3. Verify redirect to /chat
4. Check user created in database

**Expected Results:**
- ✅ Redirects to Google consent screen
- ✅ Returns to app after approval
- ✅ User profile stored with Google provider
- ✅ Subsequent logins work instantly

#### Facebook OAuth (if configured)
1. Click "Continue with Facebook"
2. Complete Facebook sign-in flow
3. Verify redirect to /chat

**Expected Results:**
- ✅ Facebook login works
- ✅ User profile stored correctly

---

### 3. Chat Functionality Tests

#### Basic Chat Test
1. Log in to the application
2. Type a simple message: "Hello"
3. Send the message

**Expected Results:**
- ✅ Message appears in chat window
- ✅ AI responds within 3-5 seconds
- ✅ Response is relevant
- ✅ Markdown formatting works (if AI uses markdown)

#### Complex Query Test
1. Ask: "Explain how Next.js works"
2. Wait for response

**Expected Results:**
- ✅ Detailed response provided
- ✅ Response is accurate
- ✅ No timeout errors

#### Web Search Test (if Google Search API configured)
1. Ask: "What's the latest news today?"
2. Check response

**Expected Results:**
- ✅ Response includes current information
- ✅ Sources may be mentioned
- ✅ Information is up-to-date

---

### 4. Export Functionality Tests

#### Export as Word
1. Have a conversation with 3-5 messages
2. Click "Export as Word" in sidebar
3. Check downloaded file

**Expected Results:**
- ✅ File downloads automatically
- ✅ Filename includes timestamp
- ✅ File contains chat history

#### Export as Excel
1. Click "Export as Excel"
2. Open downloaded file

**Expected Results:**
- ✅ File downloads
- ✅ Contains chat data

#### Export as PDF
1. Click "Export as PDF"
2. Open downloaded file

**Expected Results:**
- ✅ File downloads
- ✅ Readable format

---

### 5. UI/UX Tests

#### Responsive Design Test
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ All buttons are clickable
- ✅ Text is readable
- ✅ No horizontal scroll
- ✅ Sidebar toggles on mobile

#### Dark Mode Test
1. Change system theme to dark mode
2. Refresh application

**Expected Results:**
- ✅ Colors adjust automatically
- ✅ Text remains readable
- ✅ Contrast is good

---

### 6. Error Handling Tests

#### Invalid Login Test
1. Try to log in with wrong password
2. Check error message

**Expected Results:**
- ✅ Error message displayed
- ✅ Password field cleared
- ✅ No console errors

#### Network Error Test
1. Disconnect internet
2. Try to send a chat message
3. Reconnect and try again

**Expected Results:**
- ✅ Error message shown
- ✅ User can retry
- ✅ Works after reconnection

#### API Key Missing Test
1. Remove `GEMINI_API_KEY` from `.env`
2. Restart server
3. Try to chat

**Expected Results:**
- ✅ Clear error message
- ✅ App doesn't crash
- ✅ User informed of configuration issue

---

## 🐛 Debugging Guide

### Common Issues & Solutions

#### Issue: "Cannot connect to MongoDB"

**Symptoms:**
- Error: `MongoNetworkError: connect ECONNREFUSED`
- Database operations fail

**Solutions:**
```bash
# Check MongoDB service (Windows)
net start MongoDB

# Or verify MongoDB Atlas connection string
# Make sure IP is whitelisted in Atlas
```

#### Issue: "API key not configured"

**Symptoms:**
- Chat returns "AI service not configured"
- 500 error on /api/chat

**Solutions:**
1. Check `.env` file has `GEMINI_API_KEY`
2. Verify no extra spaces in API key
3. Restart dev server after changing .env

#### Issue: "NextAuth error"

**Symptoms:**
- OAuth login fails
- Session errors

**Solutions:**
1. Verify `NEXTAUTH_URL` matches current URL
2. Check `NEXTAUTH_SECRET` is set
3. For OAuth: verify redirect URIs in provider console

#### Issue: Build fails

**Symptoms:**
- `npm run build` errors
- TypeScript errors

**Solutions:**
```bash
# Clear Next.js cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

---

## 🔍 Debugging Tools

### Browser DevTools

**Console Tab:**
- Check for JavaScript errors
- View console.log outputs
- Monitor network requests

**Network Tab:**
- Inspect API calls
- Check response status codes
- View request/response bodies

**Application Tab:**
- View cookies
- Check localStorage
- Inspect session data

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging Best Practices

Add debug logging in API routes:
```typescript
console.log('Request body:', req.body);
console.log('User session:', session);
console.log('API response:', response);
```

---

## 📊 Performance Testing

### Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Review scores

**Target Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Load Testing

Use tools like:
- **k6**: `k6 run loadtest.js`
- **Artillery**: `artillery run scenario.yml`
- **Apache Bench**: `ab -n 1000 -c 10 http://localhost:3000/`

---

## 🧹 Code Quality Checks

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Format Code
```bash
npm run format
```

---

## 📝 Testing Checklist Before Deployment

- [ ] All authentication methods tested
- [ ] Chat functionality works with various inputs
- [ ] Export features work for all formats
- [ ] Responsive design works on all screen sizes
- [ ] Dark mode works correctly
- [ ] Error handling is graceful
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] MongoDB connection stable
- [ ] API rate limits not exceeded
- [ ] OAuth redirect URIs updated for production
- [ ] Build completes successfully (`npm run build`)
- [ ] Production server starts (`npm start`)
- [ ] All links work
- [ ] Images load correctly
- [ ] Performance is acceptable (Lighthouse > 80)

---

## 🔐 Security Testing

### Check for Common Vulnerabilities

```bash
# Check for dependency vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix
```

### Security Checklist

- [ ] Passwords are hashed (bcrypt)
- [ ] API keys not exposed in client code
- [ ] `.env` file not committed to Git
- [ ] HTTPS enabled in production
- [ ] CSRF protection enabled (NextAuth)
- [ ] SQL injection not possible (using Mongoose)
- [ ] XSS protection in place (React escapes by default)
- [ ] Rate limiting considered
- [ ] Input validation on all forms

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**: Look at terminal output for errors
2. **Review documentation**: README.md, SETUP.md, API_KEYS_GUIDE.md
3. **Search GitHub issues**: Common problems may be documented
4. **Ask for help**: Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version)
   - Screenshots if relevant

---

## ✅ Quick Test Script

Run this to test everything quickly:

```bash
# 1. Check environment
node --version
npm --version

# 2. Clean install
npm run clean
npm install

# 3. Type check
npm run type-check

# 4. Lint
npm run lint

# 5. Build
npm run build

# 6. Start production server
npm start
```

If all steps pass, your app is ready! 🚀

---

**Happy Testing! 🧪**
