'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create or update user in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .single()

      let userId: string

      if (existingUser) {
        // Update existing user's online status
        userId = existingUser.id
        await supabase
          .from('users')
          .update({ 
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', userId)
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: crypto.randomUUID(),
            username: username.trim(),
            is_online: true,
          })
          .select()
          .single()

        if (createError) throw createError
        userId = newUser.id
      }

      // Store user info in localStorage
      localStorage.setItem('userId', userId)
      localStorage.setItem('username', username.trim())

      // Navigate to lobby
      router.push('/lobby')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="glass-card p-8 md:p-12 max-w-md w-full animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
            36 Flags
          </h1>
          <p className="text-gray-300 text-lg">
            A Multiplayer Memory Challenge
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Enter Your Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
              placeholder="Choose a username..."
              maxLength={20}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entering Lobby...
              </span>
            ) : (
              'Enter Lobby'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <h2 className="text-lg font-semibold mb-3 text-primary-300">How to Play</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="text-primary-400 mr-2">•</span>
              <span>Find matching pairs of country flags on a 6×6 grid</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-400 mr-2">•</span>
              <span>Challenge other players in the waiting room</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-400 mr-2">•</span>
              <span>Take turns revealing flags to find matches</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-400 mr-2">•</span>
              <span>Collect the most pairs to win!</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
