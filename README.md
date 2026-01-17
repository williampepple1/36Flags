# 36 Flags - Updated with Supabase Auth

## 🔐 Authentication System

The game now uses **Supabase Authentication** for secure user management!

### Features

- ✅ **Email/Password Authentication**
- ✅ **Secure Sessions** with JWT tokens
- ✅ **Password Hashing** (bcrypt)
- ✅ **Row Level Security** (RLS)
- ✅ **Protected Routes**
- ✅ **Automatic Session Management**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase/schema.sql` in SQL Editor
3. Get your project URL and anon key from Settings → API

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. (Optional) Disable Email Confirmation for Development

In Supabase Dashboard:
- Go to **Authentication** → **Settings**
- Disable **Enable email confirmations**
- (Keep it enabled for production!)

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 How to Use

### Sign Up

1. Click **Sign Up** tab
2. Enter:
   - **Username** (3-20 characters, unique)
   - **Email** (valid email address)
   - **Password** (minimum 6 characters)
3. Click **Create Account**
4. You'll be automatically logged in and redirected to the lobby

### Login

1. Click **Login** tab
2. Enter your email and password
3. Click **Login**
4. Redirected to lobby

### Play

1. See online players in the lobby
2. Send a challenge to another player
3. Wait for them to accept
4. Play the game!
5. Winner is determined by most pairs collected

## 🔧 What Changed

### Database Schema

**Users table now includes:**
- `auth_id` - Links to Supabase Auth (UUID)
- `email` - User's email address
- Enhanced RLS policies for security

### Authentication Flow

**Before:** Simple username entry
**Now:** Full email/password authentication with:
- Secure password hashing
- Session management
- Protected routes
- Email verification (optional)

### Security Improvements

- ✅ Row Level Security on all tables
- ✅ Auth-based access control
- ✅ Secure session tokens
- ✅ Password encryption
- ✅ CSRF protection

## 📚 Documentation

- **[SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md)** - Detailed auth setup guide
- **[SETUP.md](./SETUP.md)** - General setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Feature overview

## 🎮 Game Features

All original features remain:
- ✅ 6×6 grid with 36 flags
- ✅ 17 pairs + 1 unique + 1 white flag
- ✅ Real-time multiplayer
- ✅ Turn-based gameplay
- ✅ Online status tracking
- ✅ Game invitations
- ✅ Winner determination

**Plus new security features!**

## 🔐 Security Features

### Authentication
- Email/password login
- Secure password hashing (bcrypt)
- JWT session tokens
- Automatic token refresh
- Secure logout

### Database
- Row Level Security (RLS)
- Auth-based policies
- Foreign key constraints
- Data validation

### Application
- Protected routes
- Session verification
- CSRF protection
- XSS prevention

## 🐛 Troubleshooting

### Can't login?
- Verify email and password are correct
- Check if email confirmation is required
- Look for error messages

### Email confirmation required?
- Check your email for confirmation link
- Or disable in Supabase settings (dev only)

### Session expired?
- Simply login again
- Sessions auto-refresh but may expire after long inactivity

### Database errors?
- Verify schema was run correctly
- Check RLS policies are enabled
- Ensure auth_id links are correct

## 🚀 Deployment

### Vercel Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Production Checklist

- ✅ Enable email confirmation
- ✅ Configure email templates
- ✅ Set up custom domain
- ✅ Enable HTTPS
- ✅ Review RLS policies
- ✅ Set up monitoring

## 🎯 Future Enhancements

Possible additions:
- Password reset functionality
- OAuth providers (Google, GitHub)
- User profile editing
- Avatar uploads
- 2FA (two-factor authentication)
- Game history and statistics
- Leaderboards
- Friend system
- Chat during games

## 📄 License

MIT License - feel free to use for learning or commercial purposes.

---

**Enjoy your secure multiplayer game! 🎮🔐**
