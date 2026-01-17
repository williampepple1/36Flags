# Email Confirmation Setup Guide

## 📧 Email Confirmation Callback - Complete Setup

I've added the email confirmation callback handler. Here's how to set it up:

## Quick Setup Steps

### Step 1: Install New Dependency

Run this command to install the auth helpers:

```bash
npm install @supabase/auth-helpers-nextjs
```

### Step 2: Configure Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add these URLs to **Redirect URLs**:

**For Development:**
```
http://localhost:3000/auth/callback
```

**For Production (when deployed):**
```
https://your-domain.com/auth/callback
```

Click **Save**

### Step 3: Choose Your Email Confirmation Strategy

You have two options:

#### Option A: Disable Email Confirmation (Development Only)

**Fastest for testing:**

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **OFF**: "Enable email confirmations"
4. Click **Save**

✅ Users can sign up and login immediately
❌ Not secure for production

#### Option B: Enable Email Confirmation (Production)

**Recommended for production:**

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **ON**: "Enable email confirmations"
4. Click **Save**

✅ Secure - verifies email addresses
✅ Prevents fake accounts
⏱️ Users must check email before logging in

### Step 4: Test the Flow

#### If Email Confirmation is DISABLED:

1. Sign up with email/password
2. Automatically logged in
3. Redirected to lobby
4. ✅ Done!

#### If Email Confirmation is ENABLED:

1. Sign up with email/password
2. See message: "Check your email for confirmation link"
3. Check your email inbox
4. Click the confirmation link
5. Redirected to `/auth/callback`
6. Automatically logged in
7. Redirected to lobby
8. ✅ Done!

## How It Works

### The Flow

```
User Signs Up
    ↓
Supabase sends confirmation email
    ↓
User clicks link in email
    ↓
Redirected to: /auth/callback?code=xxx
    ↓
Callback handler exchanges code for session
    ↓
User logged in
    ↓
Redirected to /lobby
```

### The Code

**Callback Handler** (`app/auth/callback/route.ts`):
- Receives the confirmation code from email link
- Exchanges code for a valid session
- Redirects user to lobby

**Signup Page** (`app/page.tsx`):
- Includes `emailRedirectTo` option
- Points to `/auth/callback`
- Ensures proper redirect after confirmation

## Customizing Email Templates

### Default Email Template

Supabase sends a default confirmation email. To customize:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Customize the template:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Welcome to 36 Flags!</p>
```

4. Click **Save**

### Available Variables

- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Token }}` - The confirmation token
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL

## Troubleshooting

### "Invalid redirect URL"

**Problem:** Redirect URL not whitelisted

**Solution:**
1. Go to **Authentication** → **URL Configuration**
2. Add `http://localhost:3000/auth/callback` to Redirect URLs
3. Save and try again

### Email not received

**Problem:** Email not arriving

**Solutions:**
- Check spam folder
- Verify email address is correct
- Check Supabase logs: **Authentication** → **Logs**
- For development, disable email confirmation

### Callback not working

**Problem:** Stuck on callback page

**Solutions:**
- Verify `npm install` was run
- Check browser console for errors
- Verify callback route exists at `app/auth/callback/route.ts`
- Restart dev server

### User not logged in after confirmation

**Problem:** Redirected but not authenticated

**Solutions:**
- Check callback handler is exchanging code properly
- Verify session is being created
- Check browser cookies are enabled
- Try clearing browser cache

## Production Deployment

### Vercel/Netlify

1. Deploy your app
2. Get your production URL (e.g., `https://36flags.vercel.app`)
3. In Supabase Dashboard:
   - Go to **Authentication** → **URL Configuration**
   - Add: `https://your-domain.com/auth/callback`
   - Update **Site URL** to: `https://your-domain.com`
4. Test signup flow in production

### Custom Domain

If using a custom domain:

1. Add custom domain in Vercel/Netlify
2. Update Supabase redirect URLs:
   - `https://yourdomain.com/auth/callback`
3. Update Site URL:
   - `https://yourdomain.com`

## Email Provider Configuration (Optional)

By default, Supabase uses their email service. For production, consider:

### Using Custom SMTP

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your SMTP provider:
   - SendGrid
   - Mailgun
   - AWS SES
   - Custom SMTP server

### Benefits of Custom SMTP

- ✅ Better deliverability
- ✅ Custom sender email
- ✅ Higher sending limits
- ✅ Better analytics

## Testing Checklist

- [ ] Install auth helpers: `npm install @supabase/auth-helpers-nextjs`
- [ ] Add redirect URL in Supabase
- [ ] Choose email confirmation strategy
- [ ] Test signup flow
- [ ] Test email confirmation (if enabled)
- [ ] Test callback redirect
- [ ] Test login after confirmation
- [ ] Verify user can access lobby

## Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

**Your email confirmation is now properly configured! 📧✅**
