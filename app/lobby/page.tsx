'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { Player, Invitation } from '@/lib/types'

export default function Lobby() {
  const [currentUser, setCurrentUser] = useState<Player | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
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

      setCurrentUser({
        id: userProfile.id,
        username: userProfile.username,
        isOnline: true
      })

      // Update online status
      await updateOnlineStatus(userProfile.id, true)

      loadOnlinePlayers(userProfile.id)
      loadInvitations(userProfile.id)
      subscribeToChanges(userProfile.id)

      // Set up heartbeat to maintain online status
      const heartbeat = setInterval(() => updateOnlineStatus(userProfile.id, true), 30000)

      // Handle page unload
      const handleUnload = () => {
        updateOnlineStatus(userProfile.id, false)
      }
      window.addEventListener('beforeunload', handleUnload)

      return () => {
        clearInterval(heartbeat)
        window.removeEventListener('beforeunload', handleUnload)
        updateOnlineStatus(userProfile.id, false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const updateOnlineStatus = async (userId: string, isOnline = true) => {
    await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId)
  }

  const loadOnlinePlayers = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true)
      .neq('id', currentUserId)

    if (data) {
      setOnlinePlayers(data.map(u => ({
        id: u.id,
        username: u.username,
        isOnline: u.is_online
      })))
    }
  }

  const loadInvitations = async (userId: string) => {
    const { data, error } = await supabase
      .from('game_invitations')
      .select(`
        *,
        sender:users!game_invitations_sender_id_fkey(*),
        receiver:users!game_invitations_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'pending')

    if (data) {
      const formattedInvitations: Invitation[] = data.map((inv: any) => ({
        id: inv.id,
        sender: {
          id: inv.sender.id,
          username: inv.sender.username,
          isOnline: inv.sender.is_online
        },
        receiver: {
          id: inv.receiver.id,
          username: inv.receiver.username,
          isOnline: inv.receiver.is_online
        },
        status: inv.status,
        createdAt: inv.created_at
      }))
      setInvitations(formattedInvitations)
    }
  }

  const subscribeToChanges = (userId: string) => {
    // Subscribe to user changes
    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => loadOnlinePlayers(userId)
      )
      .subscribe()

    // Subscribe to invitation changes
    const invitationsChannel = supabase
      .channel('invitations-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_invitations' },
        (payload) => {
          loadInvitations(userId)
          
          // Check if invitation was accepted
          if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted') {
            checkForActiveGame(userId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(invitationsChannel)
    }
  }

  const checkForActiveGame = async (userId: string) => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'active')
      .single()

    if (data) {
      router.push(`/game/${data.id}`)
    }
  }

  const sendInvitation = async (receiverId: string) => {
    if (!currentUser) return

    const { error } = await supabase
      .from('game_invitations')
      .insert({
        sender_id: currentUser.id,
        receiver_id: receiverId,
        status: 'pending'
      })

    if (!error) {
      loadInvitations(currentUser.id)
    }
  }

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    const { error } = await supabase
      .from('game_invitations')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', invitationId)

    if (!error && accept) {
      // Create game
      const invitation = invitations.find(inv => inv.id === invitationId)
      if (invitation) {
        await createGame(invitation.sender.id, invitation.receiver.id)
      }
    }

    if (currentUser) {
      loadInvitations(currentUser.id)
    }
  }

  const createGame = async (player1Id: string, player2Id: string) => {
    const { generateBoard } = await import('@/lib/gameUtils')
    const board = generateBoard()
    
    // Randomly select who goes first
    const firstPlayer = Math.random() < 0.5 ? player1Id : player2Id

    const { data, error } = await supabase
      .from('games')
      .insert({
        player1_id: player1Id,
        player2_id: player2Id,
        current_turn: firstPlayer,
        board_state: board,
        player1_matches: [],
        player2_matches: [],
        status: 'active'
      })
      .select()
      .single()

    if (data) {
      router.push(`/game/${data.id}`)
    }
  }

  const handleLogout = async () => {
    if (currentUser) {
      await updateOnlineStatus(currentUser.id, false)
    }
    await supabase.auth.signOut()
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading lobby...</p>
        </div>
      </div>
    )
  }

  const receivedInvitations = invitations.filter(inv => inv.receiver.id === currentUser?.id)
  const sentInvitations = invitations.filter(inv => inv.sender.id === currentUser?.id)

  return (
    <main className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Game Lobby</h1>
            <p className="text-gray-300 mt-1">Welcome, {currentUser?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-outline"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Online Players */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4 text-primary-300">
              Online Players ({onlinePlayers.length})
            </h2>
            
            {onlinePlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No other players online</p>
                <p className="text-sm mt-2">Invite a friend to play!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {onlinePlayers.map(player => {
                  const alreadyInvited = sentInvitations.some(inv => inv.receiver.id === player.id)
                  
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">{player.username}</span>
                      </div>
                      
                      {alreadyInvited ? (
                        <span className="text-sm text-gray-400">Invitation sent</span>
                      ) : (
                        <button
                          onClick={() => sendInvitation(player.id)}
                          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Challenge
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Invitations */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4 text-accent-300">
              Game Invitations
            </h2>

            {receivedInvitations.length === 0 && sentInvitations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No pending invitations</p>
                <p className="text-sm mt-2">Challenge a player to start!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Received Invitations */}
                {receivedInvitations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">RECEIVED</h3>
                    <div className="space-y-2">
                      {receivedInvitations.map(invitation => (
                        <div
                          key={invitation.id}
                          className="p-4 bg-accent-500/20 border border-accent-500/30 rounded-lg"
                        >
                          <p className="mb-3">
                            <span className="font-semibold text-accent-300">{invitation.sender.username}</span>
                            {' '}wants to play!
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => respondToInvitation(invitation.id, true)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToInvitation(invitation.id, false)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sent Invitations */}
                {sentInvitations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">SENT</h3>
                    <div className="space-y-2">
                      {sentInvitations.map(invitation => (
                        <div
                          key={invitation.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
                        >
                          <span>
                            Waiting for <span className="font-semibold">{invitation.receiver.username}</span>
                          </span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
