# Facebook Login Setup Guide

## Changes Made

### ✅ Fixed Facebook Profile Picture Display
Updated the authentication system to properly fetch and display Facebook profile pictures, just like Google login.

### Files Modified

1. **[lib/auth.ts](lib/auth.ts)**
   - Added custom `profile()` function to FacebookProvider
   - Fetches high-quality profile picture from Facebook Graph API
   - Fallback to Graph API URL if picture data is not in profile
   - Updated `signIn` callback to update existing user images
   - Enhanced `session` callback to fetch latest user data from database

2. **[models/User.ts](models/User.ts)**
   - Added `updateImage()` method to update user profile pictures
   - Allows updating images without affecting other user data

## Features

✅ **Facebook Profile Pictures**
- Automatically fetches Facebook profile pictures during login
- Uses high-quality images (200x200 pixels)
- Updates existing users' pictures on each login
- Falls back to initials if no picture available

✅ **Google Profile Pictures** (already working)
- Continues to work as before
- Shows profile picture or initials

✅ **Unified Experience**
- Both Google and Facebook users see their profile pictures
- Consistent display across the app
- Profile pictures shown in navbar dropdown

## Setup Facebook OAuth

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" or "Business" type
4. Fill in app name and contact email
5. Click "Create App"

### Step 2: Configure Facebook Login

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Enter your site URL: `http://localhost:3000` (for development)
5. Save changes

### Step 3: Get App Credentials

1. Go to Settings → Basic
2. Copy your **App ID** (this is your `FACEBOOK_CLIENT_ID`)
3. Click "Show" on **App Secret** (this is your `FACEBOOK_CLIENT_SECRET`)

### Step 4: Configure OAuth Redirect URIs

1. Go to Facebook Login → Settings
2. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://your-domain.com/api/auth/callback/facebook
   ```
3. Save changes

### Step 5: Set App to Live Mode

1. Go to App Settings → Basic
2. Toggle the app from "Development" to "Live" mode
3. Choose a category for your app
4. Add Privacy Policy URL (required for live apps)

### Step 6: Update Environment Variables

Update your `.env.local` file:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id-here
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret-here

# Make sure these are also set
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string-here
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Testing

### Test Facebook Login Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Click "Log In" button**
   - Should show login modal

3. **Click "Continue with Facebook"**
   - Redirects to Facebook
   - Login with your Facebook account
   - Grant permissions

4. **After successful login:**
   - ✅ You should see your Facebook profile picture in the navbar
   - ✅ Or your initials if no picture is available
   - ✅ Your name and email should appear in the dropdown menu

### Verify Profile Picture

Check that the profile picture displays:
- In the top-right corner of navbar
- Circular format (36x36px)
- Click on it to see dropdown with name and email

### Verify Database

Check Supabase `users` table should have:
- `email`: Your Facebook email
- `name`: Your Facebook name
- `image`: URL to your Facebook profile picture
- `provider`: "facebook"

## Troubleshooting

### Profile Picture Not Showing

1. **Check Facebook App Permissions**
   - Go to Facebook App → App Review
   - Ensure "public_profile" and "email" permissions are granted
   - These are default permissions and should be available

2. **Check Browser Console**
   - Look for image loading errors
   - Facebook Graph API URLs might be blocked by CORS

3. **Check Database**
   ```sql
   SELECT email, name, image, provider 
   FROM users 
   WHERE provider = 'facebook';
   ```
   - Verify `image` field has a valid URL

4. **Clear Session and Re-login**
   - Sign out completely
   - Clear browser cookies
   - Sign in again with Facebook

### Facebook Login Fails

1. **Check Environment Variables**
   - Verify `FACEBOOK_CLIENT_ID` is correct
   - Verify `FACEBOOK_CLIENT_SECRET` is correct
   - Restart dev server after changes

2. **Check Redirect URI**
   - Must match exactly in Facebook App settings
   - Include protocol (http/https)
   - Include `/api/auth/callback/facebook` path

3. **Check App Status**
   - Ensure app is in "Live" mode for production
   - In development, add test users in App Roles

### "This app is in Development Mode" Error

- Your Facebook app is not yet public
- Either:
  - Add test users: App Roles → Test Users
  - Submit for app review (for production)
  - Switch app to Live mode (Settings → Basic)

## Production Deployment

### Update Redirect URIs

Add your production URLs:
```
https://your-domain.com/api/auth/callback/facebook
https://www.your-domain.com/api/auth/callback/facebook
```

### Update Environment Variables

On Vercel/Railway/etc.:
```env
NEXTAUTH_URL=https://your-domain.com
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
NEXTAUTH_SECRET=your-production-secret
```

### App Review (Optional)

For advanced permissions beyond `public_profile` and `email`, submit your app for Facebook review.

## Facebook Graph API

The profile picture URL format:
```
https://graph.facebook.com/{user-id}/picture?type=large&width=200&height=200
```

Types available:
- `small`: 50x50px
- `normal`: 100x100px  
- `large`: 200x200px (we use this)
- `square`: 50x50px

## Security Notes

- ✅ Profile pictures are fetched server-side during authentication
- ✅ Images are stored as URLs in database, not downloaded
- ✅ Facebook serves images over HTTPS
- ✅ RLS policies protect user data
- ✅ Session strategy uses JWT for security

## Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
- [Facebook App Development](https://developers.facebook.com/docs/development)
