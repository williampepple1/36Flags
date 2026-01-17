# 36 Flags - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Login Page  │───▶│  Lobby Page  │───▶│  Game Page   │  │
│  │              │    │              │    │              │  │
│  │ - Username   │    │ - Players    │    │ - 6x6 Grid   │  │
│  │ - Auth       │    │ - Invites    │    │ - Turns      │  │
│  │              │    │ - Status     │    │ - Scoring    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Component Layer                        │    │
│  │  - FlagCard (flip animation, state management)      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Utility Layer                          │    │
│  │  - gameUtils (board, matching, winner logic)        │    │
│  │  - types (interfaces, constants)                    │    │
│  │  - supabase (database client)                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Real-time WebSocket
                            │ REST API Calls
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      SUPABASE BACKEND                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                    │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │  users   │  │ invitations  │  │    games     │  │    │
│  │  ├──────────┤  ├──────────────┤  ├──────────────┤  │    │
│  │  │ id       │  │ id           │  │ id           │  │    │
│  │  │ username │  │ sender_id    │  │ player1_id   │  │    │
│  │  │ online   │  │ receiver_id  │  │ player2_id   │  │    │
│  │  │ last_seen│  │ status       │  │ board_state  │  │    │
│  │  └──────────┘  └──────────────┘  │ matches      │  │    │
│  │                                   │ current_turn │  │    │
│  │                                   │ status       │  │    │
│  │                                   └──────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Realtime Engine                        │    │
│  │  - Broadcasts database changes via WebSocket        │    │
│  │  - Subscriptions to table changes                   │    │
│  │  - Low-latency updates (<100ms)                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Row Level Security                     │    │
│  │  - Policy-based access control                      │    │
│  │  - Secure data isolation                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Login Flow
```
User Input → Validate → Check Existing User
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 Exists            New User
                    │                   │
              Update Status      Create Record
                    │                   │
                    └─────────┬─────────┘
                              │
                    Store in localStorage
                              │
                    Navigate to Lobby
```

### 2. Invitation Flow
```
Player A                    Supabase                    Player B
   │                           │                           │
   │──Send Challenge──────────▶│                           │
   │                           │                           │
   │                           │──Realtime Update─────────▶│
   │                           │                           │
   │                           │◀──Accept/Reject───────────│
   │                           │                           │
   │◀─Realtime Update──────────│                           │
   │                           │                           │
   │                      Create Game                      │
   │                           │                           │
   │◀──Redirect to Game────────┼──────Redirect to Game────▶│
```

### 3. Game Turn Flow
```
Player's Turn
     │
     │ Click Card 1
     │     │
     │     └──▶ Reveal Card 1 ──▶ Update DB ──▶ Broadcast
     │
     │ Click Card 2
     │     │
     │     └──▶ Reveal Card 2 ──▶ Update DB ──▶ Broadcast
     │
     │ Check Match
     │     │
     ├─────┴─────┐
     │           │
   Match      No Match
     │           │
 Add Points   Hide Cards
 Keep Turn    Switch Turn
     │           │
     └─────┬─────┘
           │
      Update DB ──▶ Broadcast ──▶ Other Player Sees Update
```

### 4. Real-time Synchronization
```
┌──────────────┐                    ┌──────────────┐
│   Player 1   │                    │   Player 2   │
│   Browser    │                    │   Browser    │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ Make Move                         │
       │                                   │
       └──────────▶┌──────────────┐◀───────┘
                   │   Supabase   │
                   │   Realtime   │
                   └──────┬───────┘
                          │
       ┌──────────────────┴──────────────────┐
       │                                     │
       ▼                                     ▼
  Update UI                             Update UI
  (Player 1)                            (Player 2)
```

## Component Hierarchy

```
RootLayout
  └─ globals.css (styling)
  └─ Page (Login)
  └─ Lobby
      └─ Online Players List
      └─ Invitations Panel
  └─ Game/[id]
      └─ Player Info Sidebar
      │   └─ Current Player Card
      │   └─ Opponent Card
      └─ Game Board (6x6 Grid)
          └─ FlagCard (×36)
              └─ Card Front (hidden flag)
              └─ Card Back (revealed flag)
```

## State Management

### Local State (React useState)
- Selected cards during turn
- Loading states
- UI toggles

### Server State (Supabase)
- User online status
- Game invitations
- Game state (board, turns, scores)

### Local Storage
- User ID
- Username

### Real-time Subscriptions
- User table changes → Update online players
- Invitation table changes → Update invitations
- Game table changes → Update game board

## Security Model

```
Client Request
     │
     ▼
Supabase Client (with anon key)
     │
     ▼
Row Level Security Check
     │
     ├─ Allowed? ──▶ Execute Query ──▶ Return Data
     │
     └─ Denied? ───▶ Return Error
```

## Deployment Architecture

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       │ git push
       │
       ▼
┌─────────────┐         ┌──────────────┐
│   Vercel    │◀───────▶│   Supabase   │
│  (Frontend) │  API    │  (Backend)   │
└──────┬──────┘         └──────────────┘
       │
       │ HTTPS
       │
       ▼
┌─────────────┐
│    Users    │
│  (Browsers) │
└─────────────┘
```

## Technology Stack Details

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3
- **State:** React Hooks + Supabase Realtime

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Real-time:** Supabase Realtime (WebSocket)
- **Auth:** Simple username-based (no passwords)
- **Storage:** Supabase PostgreSQL

### DevOps
- **Version Control:** Git
- **Hosting:** Vercel (recommended)
- **Database Hosting:** Supabase Cloud
- **CI/CD:** Vercel automatic deployments

## Performance Optimizations

1. **Real-time Updates:** WebSocket for instant synchronization
2. **Optimistic UI:** Immediate feedback before server confirmation
3. **Image CDN:** FlagCDN for fast flag loading
4. **Next.js:** Server-side rendering for fast initial load
5. **Tailwind:** Purged CSS for minimal bundle size
6. **TypeScript:** Compile-time error catching

---

This architecture provides a scalable, real-time multiplayer gaming experience with excellent performance and user experience.
