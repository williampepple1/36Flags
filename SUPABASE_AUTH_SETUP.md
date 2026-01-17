# Supabase Auth Setup Guide for 36 Flags

## Overview
The application now uses **Supabase Authentication** with email/password for secure user management.

## What Changed

### Before (Simple Username)
- Users entered just a username
- No passwords
- No security
- Anyone could use any username

### After (Supabase Auth)
- Email + password authentication
- Secure sessions
- Password management
- Protected user accounts
- Unique usernames

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details
5. Wait for project to be ready (~2 minutes)

### 2. Configure Email Authentication

By default, Supabase Auth is enabled. You can customize settings:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation, reset password emails

### 3. Set Up Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Verify tables were created:
   - `users` (with `auth_id` column)
   - `game_invitations`
   - `games`

### 4. Configure Environment Variables

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
- **Settings** → **API** in Supabase Dashboard

### 5. Email Confirmation Settings (Optional)

By default, Supabase requires email confirmation. You can disable this for development:

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **Enable email confirmations** OFF (for development only)
4. For production, keep it ON for security

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How Authentication Works

### Sign Up Flow

1. User enters:
   - Username (must be unique)
   - Email
   - Password (min 6 characters)

2. System:
   - Creates auth user in `auth.users` (Supabase Auth)
   - Creates profile in `users` table with `auth_id` link
   - Logs user in automatically
   - Redirects to lobby

### Login Flow

1. User enters:
   - Email
   - Password

2. System:
   - Verifies credentials with Supabase Auth
   - Gets user profile from `users` table
   - Updates online status
   - Redirects to lobby

### Session Management

- Sessions are automatically managed by Supabase
- Tokens are stored in browser (httpOnly cookies)
- Auto-refresh for long sessions
- Secure logout clears all session data

### Protected Routes

All pages except login are protected:
- **Lobby**: Checks for valid auth session
- **Game**: Checks for valid auth session
- If no session → Redirect to login

## Database Schema Changes

### Users Table

**New columns:**
- `auth_id` - Links to Supabase Auth user (UUID, UNIQUE)
- `email` - User's email address

**Updated columns:**
- `id` - Still used as internal user ID
- `username` - Still unique, chosen during signup

### Row Level Security (RLS)

Enhanced security policies:

**Users table:**
- Anyone can view users (for lobby)
- Users can only insert their own profile (`auth.uid() = auth_id`)
- Users can only update their own profile

**Game invitations:**
- Anyone can view (for lobby)
- Only authenticated users can create
- Only sender/receiver can update

**Games:**
- Anyone can view (for spectating)
- Only authenticated users can create
- Only players can update their games

## Testing the Authentication

### Test Sign Up

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **Sign Up** tab
3. Enter:
   - Username: `player1`
   - Email: `player1@test.com`
   - Password: `password123`
4. Click **Create Account**
5. Should redirect to lobby

### Test Login

1. Logout from lobby
2. Click **Login** tab
3. Enter:
   - Email: `player1@test.com`
   - Password: `password123`
4. Click **Login**
5. Should redirect to lobby

### Test Multiplayer

1. Open two browser windows (or one incognito)
2. Sign up as two different users:
   - Window 1: `player1@test.com`
   - Window 2: `player2@test.com`
3. Send challenge from one to the other
4. Accept and play!

## Security Features

✅ **Password Hashing** - Passwords never stored in plain text
✅ **Secure Sessions** - JWT tokens with automatic refresh
✅ **Email Verification** - Optional email confirmation
✅ **Password Reset** - Built-in password recovery (can be enabled)
✅ **Row Level Security** - Database-level access control
✅ **HTTPS Only** - Secure communication (in production)

## Troubleshooting

### "Invalid login credentials"
- Check email and password are correct
- Verify user was created successfully
- Check Supabase Auth dashboard for user

### "User profile not found"
- Check `users` table has entry with matching `auth_id`
- Verify database schema was run correctly
- Check RLS policies allow insert

### Email confirmation required
- Check email for confirmation link
- Or disable email confirmation in Supabase settings (dev only)

### Session expired
- User needs to login again
- Check token expiration settings in Supabase

## Advanced Configuration

### Enable Password Reset

1. In Supabase Dashboard: **Authentication** → **Email Templates**
2. Customize "Reset Password" template
3. Add reset password link in your app (future enhancement)

### Enable OAuth (Google, GitHub, etc.)

1. In Supabase Dashboard: **Authentication** → **Providers**
2. Enable desired provider (Google, GitHub, etc.)
3. Configure OAuth credentials
4. Add OAuth buttons to login page (future enhancement)

### Customize Email Templates

1. Go to **Authentication** → **Email Templates**
2. Edit templates:
   - Confirmation email
   - Password reset
   - Magic link (if using)
3. Use custom branding and styling

## Migration from Old System

If you had users with the old username-only system:

1. Old users need to sign up again with email/password
2. They can use the same username if available
3. Old data in `users` table can be cleaned up

## Next Steps

✅ Authentication is now fully implemented!

**Optional enhancements:**
- Add password reset functionality
- Add OAuth providers (Google, GitHub)
- Add email verification requirement
- Add user profile editing
- Add avatar uploads
- Add 2FA (two-factor authentication)

---

**Your game now has enterprise-grade authentication! 🔐**
