export interface Card {
  id: number
  country: string
  isRevealed: boolean
  isMatched: boolean
  gridIndex: number
}

export interface Player {
  id: string
  username: string
  isOnline: boolean
}

export interface GameState {
  id: string
  player1: Player
  player2: Player
  currentTurn: string
  board: Card[]
  player1Matches: string[]
  player2Matches: string[]
  status: 'active' | 'completed'
  winnerId: string | null
}

export interface Invitation {
  id: string
  sender: Player
  receiver: Player
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

// List of 17 countries for the game (pairs) + 1 unique + 1 white flag
export const COUNTRIES = [
  'us', 'gb', 'fr', 'de', 'it', 'es', 'ca', 'au', 
  'jp', 'kr', 'br', 'mx', 'in', 'cn', 'ru', 'za', 'ng'
]

export const UNIQUE_COUNTRY = 'ch' // Switzerland as the unique flag
export const WHITE_FLAG = 'white' // White flag
