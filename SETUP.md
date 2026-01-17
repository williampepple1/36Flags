# 36 Flags - Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase client library

### 2. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** 36Flags
   - **Database Password:** (choose a strong password)
   - **Region:** (choose closest to you)
5. Click "Create new project"
6. Wait for the project to be ready (~2 minutes)

### 3. Set Up Database

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase/schema.sql` in this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" or press Ctrl+Enter
7. You should see "Success. No rows returned"

### 4. Get Your Supabase Credentials

1. In Supabase dashboard, click on "Settings" (gear icon) in the left sidebar
2. Click on "API" under Project Settings
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. Copy both values

### 5. Configure Environment Variables

1. In the project root, create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

### 6. Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 7. Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Enter a username and click "Enter Lobby"
3. Open another browser window (or incognito mode)
4. Go to [http://localhost:3000](http://localhost:3000) again
5. Enter a different username
6. You should see both users in each other's lobby!
7. Send a challenge and accept it to start a game

## Troubleshooting

### "Failed to login" error
- Check that your `.env.local` file exists and has the correct values
- Verify your Supabase project is active
- Check browser console for specific errors

### Database errors
- Make sure you ran the SQL schema in Supabase
- Check that all tables were created (users, game_invitations, games)
- Verify RLS policies are enabled

### Players not appearing online
- Check that Realtime is enabled in Supabase (it should be by default)
- Verify the database schema includes the realtime publication commands
- Check browser console for WebSocket connection errors

### Cards not showing flags
- The app uses FlagCDN for flag images
- Make sure you have internet connection
- Check that `next.config.js` includes flagcdn.com in allowed domains

## Next Steps

Once everything is working:

1. **Customize the game:**
   - Change countries in `lib/types.ts`
   - Modify colors in `tailwind.config.ts`
   - Update styles in `app/globals.css`

2. **Deploy to production:**
   - Push code to GitHub
   - Deploy on Vercel
   - Add environment variables in Vercel settings

3. **Add features:**
   - Chat system
   - Leaderboards
   - Game history
   - Custom avatars
   - Sound effects

## Need Help?

Check the main README.md for more detailed information about:
- Project structure
- Game mechanics
- Customization options
- Deployment guide

Happy gaming! 🎮🏴
