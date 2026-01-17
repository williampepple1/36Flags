# 36 Flags 🏴

A thrilling multiplayer flag matching memory game built with Next.js, TypeScript, and Supabase.

![36 Flags Game](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase)

## 🎮 Game Overview

**36 Flags** is a real-time multiplayer memory matching game where two players compete to find matching pairs of country flags on a 6×6 grid.

### Game Features

- **36 Cards Total:**
  - 17 pairs of country flags (34 cards)
  - 1 unique country flag (1 card)
  - 1 white flag (1 card)

- **Turn-Based Gameplay:**
  - Players take turns revealing two flags
  - Match = Keep your turn + collect the pair
  - No match = Lose your turn
  - Most pairs collected wins!

- **Real-Time Multiplayer:**
  - Online player status tracking
  - Game invitations system
  - Live game state synchronization
  - Instant updates via Supabase Realtime

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS with custom animations
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Hosting:** Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up here](https://supabase.com))
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd 36Flags
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema:**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the SQL

3. **Get your Supabase credentials:**
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon/public` key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How to Play

1. **Login:** Enter a username to join the game lobby
2. **Find an Opponent:** See who's online and send a challenge
3. **Accept Invitation:** Wait for someone to accept your challenge
4. **Play:** Take turns revealing flags to find matching pairs
5. **Win:** Collect the most pairs to become the champion!

## 📁 Project Structure

```
36Flags/
├── app/
│   ├── game/[id]/         # Game board page
│   ├── lobby/             # Waiting room
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login page
├── components/
│   └── FlagCard.tsx       # Flag card component
├── lib/
│   ├── database.types.ts  # Supabase types
│   ├── gameUtils.ts       # Game logic
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript types
├── supabase/
│   └── schema.sql         # Database schema
└── package.json
```

## 🎨 Features

### Authentication
- Simple username-based login
- No passwords required (perfect for quick games)
- Automatic online status tracking

### Lobby System
- Real-time player list
- Send/receive game invitations
- Online status indicators
- Automatic game creation

### Game Mechanics
- 6×6 grid with 36 flag cards
- Card flip animations
- Turn-based gameplay
- Match detection
- Score tracking
- Game completion detection
- Winner determination

### Real-Time Features
- Live player status updates
- Instant invitation notifications
- Synchronized game state
- Turn indicators
- Automatic game updates

## 🎨 Design Features

- **Glassmorphism UI** with backdrop blur effects
- **Gradient backgrounds** with animated glows
- **Smooth animations** for card flips and transitions
- **Responsive design** for all screen sizes
- **Premium aesthetics** with modern color schemes
- **Micro-interactions** for enhanced UX

## 🔧 Customization

### Change Flag Countries

Edit `lib/types.ts` to modify the country list:

```typescript
export const COUNTRIES = [
  'us', 'gb', 'fr', // ... add your country codes
]
```

Country codes use ISO 3166-1 alpha-2 format (e.g., 'us' for United States).

### Modify Game Rules

Edit `lib/gameUtils.ts` to change:
- Board generation logic
- Match checking rules
- Winner determination

### Customize Styling

Edit `app/globals.css` and `tailwind.config.ts` to change:
- Color schemes
- Animations
- Typography
- Layout

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to add these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 Troubleshooting

### Cards not flipping?
- Check browser console for errors
- Ensure Supabase credentials are correct
- Verify database schema is properly set up

### Players not seeing each other?
- Check Supabase Realtime is enabled
- Verify RLS policies are correct
- Check network connectivity

### Game state not updating?
- Ensure Realtime subscriptions are active
- Check browser console for WebSocket errors
- Verify database permissions

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 🎉 Acknowledgments

- Flag images from [FlagCDN](https://flagcdn.com)
- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

**Enjoy playing 36 Flags! 🏴🎮**
