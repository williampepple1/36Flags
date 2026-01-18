import { Card, COUNTRIES, UNIQUE_COUNTRY, WHITE_FLAG } from './types'

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generates the initial game board with 36 cards
 * - 17 pairs of country flags (34 cards)
 * - 1 unique country flag (1 card)
 * - 1 white flag (1 card)
 * Total: 36 cards
 */
export function generateBoard(): Card[] {
  // Use explicit type assertion for initial array creation to bypass gridIndex check until final mapping
  const cards: any[] = []
  let id = 0

  // Add 17 pairs of country flags
  COUNTRIES.forEach(country => {
    cards.push({
      id: id++,
      country,
      isRevealed: false,
      isMatched: false,
    })
    cards.push({
      id: id++,
      country,
      isRevealed: false,
      isMatched: false,
    })
  })

  // Add unique country flag
  cards.push({
    id: id++,
    country: UNIQUE_COUNTRY,
    isRevealed: false,
    isMatched: false,
  })

  // Add white flag
  cards.push({
    id: id++,
    country: WHITE_FLAG,
    isRevealed: false,
    isMatched: false,
  })

  // Shuffle the cards
  const shuffled = shuffleArray(cards)
  
  // Assign grid index to persist position
  return shuffled.map((card, index) => ({
    ...card,
    gridIndex: index
  }))
}

/**
 * Checks if two cards match
 */
export function checkMatch(card1: Card, card2: Card): boolean {
  return card1.country === card2.country && card1.id !== card2.id
}

/**
 * Determines the winner based on matches
 */
export function determineWinner(player1Matches: string[], player2Matches: string[]): string | null {
  const p1Count = player1Matches.length
  const p2Count = player2Matches.length
  
  if (p1Count > p2Count) return 'player1'
  if (p2Count > p1Count) return 'player2'
  return null // Tie
}

/**
 * Checks if the game is complete (all pairs found)
 */
export function isGameComplete(board: Card[]): boolean {
  return board.every(card => card.isMatched || card.country === UNIQUE_COUNTRY || card.country === WHITE_FLAG)
}
