'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Card, Player, GameState } from '@/lib/types'
import { checkMatch, isGameComplete, determineWinner } from '@/lib/gameUtils'
import FlagCard from '@/components/FlagCard'

export default function Game() {
  const params = useParams()
  const gameId = params.id as string
  const router = useRouter()

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [selectedCards, setSelectedCards] = useState<Card[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoadGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  const checkAuthAndLoadGame = async () => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        router.push('/')
        return
      }

      // Get user profile from database
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single()

      if (!userProfile) {
        await supabase.auth.signOut()
        router.push('/')
        return
      }

      setCurrentUserId(userProfile.id)
      loadGame()
      subscribeToGameChanges(userProfile.id)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/')
    }
  }

  const loadGame = async () => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        player1:users!games_player1_id_fkey(*),
        player2:users!games_player2_id_fkey(*)
      `)
      .eq('id', gameId)
      .single()

    if (data) {
      const game: GameState = {
        id: data.id,
        player1: {
          id: data.player1.id,
          username: data.player1.username,
          isOnline: data.player1.is_online
        },
        player2: {
          id: data.player2.id,
          username: data.player2.username,
          isOnline: data.player2.is_online
        },
        currentTurn: data.current_turn,
        board: (data.board_state as Card[]).sort((a, b) => (a.gridIndex || 0) - (b.gridIndex || 0)),
        player1Matches: data.player1_matches,
        player2Matches: data.player2_matches,
        status: data.status,
        winnerId: data.winner_id
      }
      setGameState(game)
      
      if (game.status === 'completed') {
        setShowEndDialog(true)
      }
    }
    setLoading(false)
  }

  const subscribeToGameChanges = (userId: string) => {
    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
           const newData = payload.new
           
           // Ignore updates triggered by myself to prevent optimistic UI overwrites
           if (newData.last_updated_by === userId) return

           setGameState(prevState => {
              if (!prevState) return null
              
              const newBoard = (newData.board_state as Card[]).sort((a, b) => (a.gridIndex || 0) - (b.gridIndex || 0))
              
              if (newData.status === 'completed') {
                setShowEndDialog(true)
              }
              
              return {
                 ...prevState,
                 currentTurn: newData.current_turn,
                 board: newBoard,
                 player1Matches: newData.player1_matches,
                 player2Matches: newData.player2_matches,
                 status: newData.status,
                 winnerId: newData.winner_id
              }
           })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connection established for game updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime connection error')
        } else if (status === 'TIMED_OUT') {
          console.error('Realtime connection timed out')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleCardClick = async (card: Card) => {
    if (!gameState || isProcessing || gameState.currentTurn !== currentUserId) return
    if (selectedCards.length >= 2) return

    const newSelectedCards = [...selectedCards, card]
    setSelectedCards(newSelectedCards)

    // Reveal the card
    const updatedBoard = gameState.board.map(c =>
      c.id === card.id ? { ...c, isRevealed: true } : c
    )

    // Optimistic update
    setGameState({
      ...gameState,
      board: updatedBoard
    })

    await supabase
      .from('games')
      .update({ 
        board_state: updatedBoard,
        last_updated_by: currentUserId
      })
      .eq('id', gameId)

    // Check for match if two cards are selected
    if (newSelectedCards.length === 2) {
      setIsProcessing(true)
      
      setTimeout(async () => {
        // Optimistically calculate the result to show immediate feedback (flip back or disappear)
        await processMatch(newSelectedCards, updatedBoard)
        setSelectedCards([])
        setIsProcessing(false)
      }, 1000)
    }
  }

  const processMatch = async (cards: Card[], board: Card[]) => {
    if (!gameState) return

    const [card1, card2] = cards
    const isMatch = checkMatch(card1, card2)

    let updatedBoard = [...board]
    let player1Matches = [...gameState.player1Matches]
    let player2Matches = [...gameState.player2Matches]
    let nextTurn = gameState.currentTurn

    if (isMatch) {
      // Mark cards as matched
      updatedBoard = updatedBoard.map(c =>
        c.id === card1.id || c.id === card2.id
          ? { ...c, isMatched: true, isRevealed: true }
          : c
      )

      // Add to player's matches
      if (currentUserId === gameState.player1.id) {
        player1Matches.push(card1.country)
      } else {
        player2Matches.push(card1.country)
      }
      // Player keeps their turn
    } else {
      // Hide cards again
      updatedBoard = updatedBoard.map(c =>
        c.id === card1.id || c.id === card2.id
          ? { ...c, isRevealed: false }
          : c
      )
      // Switch turn
      nextTurn = currentUserId === gameState.player1.id 
        ? gameState.player2.id 
        : gameState.player1.id
    }

    // Check if game is complete
    const gameComplete = isGameComplete(updatedBoard)
    let winnerId = null
    let status: 'active' | 'completed' = 'active'
    let finalWinnerId = gameState.winnerId // Keep existing winner if any

    if (gameComplete) {
      const winner = determineWinner(player1Matches, player2Matches)
      finalWinnerId = winner === 'player1' ? gameState.player1.id : 
                 winner === 'player2' ? gameState.player2.id : null
      status = 'completed'
    }

    // Optimistic update of the outcome (Flip back or Match)
    const newGameState = {
        ...gameState,
        board: updatedBoard, // This contains the Hidden cards if no match, or Matched cards if match
        currentTurn: nextTurn,
        player1Matches,
        player2Matches,
        status,
        winnerId: finalWinnerId
    }
    setGameState(newGameState)

    // Update game state in DB
    await supabase
      .from('games')
      .update({
        board_state: updatedBoard,
        current_turn: nextTurn,
        player1_matches: player1Matches,
        player2_matches: player2Matches,
        status,
        winner_id: finalWinnerId,
        updated_at: new Date().toISOString(),
        last_updated_by: currentUserId
      })
      .eq('id', gameId)
  }

  const handleCloseGame = async () => {
    router.push('/lobby')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-xl text-gray-300 mb-4">Game not found</p>
          <button onClick={() => router.push('/lobby')} className="btn-primary">
            Return to Lobby
          </button>
        </div>
      </div>
    )
  }

  const isMyTurn = gameState.currentTurn === currentUserId
  const currentPlayer = currentUserId === gameState.player1.id ? gameState.player1 : gameState.player2
  const opponent = currentUserId === gameState.player1.id ? gameState.player2 : gameState.player1
  const myMatches = currentUserId === gameState.player1.id ? gameState.player1Matches : gameState.player2Matches
  const opponentMatches = currentUserId === gameState.player1.id ? gameState.player2Matches : gameState.player1Matches

  return (
    <main className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gradient">36 Flags</h1>
            <button
              onClick={handleCloseGame}
              className="btn-outline"
            >
              Leave Game
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Player Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Current Player */}
            <div className={`glass-card p-6 ${isMyTurn ? 'active-player' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{currentPlayer.username}</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-400 mb-3">You</p>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-gray-400">Matches</p>
                <p className="text-3xl font-bold text-primary-400">{myMatches.length}</p>
              </div>
              {isMyTurn && (
                <div className="mt-3 text-center">
                  <span className="inline-block bg-primary-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                    Your Turn
                  </span>
                </div>
              )}
            </div>

            {/* Opponent */}
            <div className={`glass-card p-6 ${!isMyTurn ? 'active-player' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{opponent.username}</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-400 mb-3">Opponent</p>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-gray-400">Matches</p>
                <p className="text-3xl font-bold text-accent-400">{opponentMatches.length}</p>
              </div>
              {!isMyTurn && (
                <div className="mt-3 text-center">
                  <span className="inline-block bg-accent-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                    Their Turn
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6">
              <div className="grid grid-cols-6 gap-3 md:gap-4">
                {gameState.board.map((card) => (
                  <div key={card.id} className="aspect-square">
                    {!card.isMatched ? (
                      <FlagCard
                        card={card}
                        onClick={() => handleCardClick(card)}
                        disabled={!isMyTurn || isProcessing || selectedCards.length >= 2}
                      />
                    ) : (
                      <div className="w-full h-full invisible" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game End Dialog */}
      {showEndDialog && gameState.status === 'completed' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 text-gradient">Game Over!</h2>
            
            {gameState.winnerId === currentUserId ? (
              <div>
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-2xl font-semibold text-green-400 mb-2">You Won!</p>
                <p className="text-gray-300">
                  {myMatches.length} - {opponentMatches.length}
                </p>
              </div>
            ) : gameState.winnerId === opponent.id ? (
              <div>
                <div className="text-6xl mb-4">😔</div>
                <p className="text-2xl font-semibold text-red-400 mb-2">You Lost</p>
                <p className="text-gray-300">
                  {myMatches.length} - {opponentMatches.length}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🤝</div>
                <p className="text-2xl font-semibold text-yellow-400 mb-2">It is a Tie!</p>
                <p className="text-gray-300">
                  {myMatches.length} - {opponentMatches.length}
                </p>
              </div>
            )}

            <button
              onClick={handleCloseGame}
              className="btn-primary w-full mt-6"
            >
              Return to Lobby
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
