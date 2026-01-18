'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (signInError) throw signInError

      if (data.user) {
        // Get user profile from database
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (userProfile) {
          // Update online status
          await supabase
            .from('users')
            .update({ 
              is_online: true,
              last_seen: new Date().toISOString()
            })
            .eq('id', userProfile.id)

          // Store user info in localStorage
          localStorage.setItem('userId', userProfile.id)
          localStorage.setItem('username', userProfile.username)

          // Navigate to lobby
          router.push('/lobby')
        } else {
          throw new Error('User profile not found. Please contact support.')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim() || !username.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Check if username is already taken
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.trim())
        .single()

      if (existingUsername) {
        throw new Error('Username already taken. Please choose another.')
      }

      // Sign up with Supabase Auth
      // We pass the username in metadata so the database trigger can create the profile
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username.trim(),
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Wait a brief moment for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Get the created profile
        const { data: userProfile, error: profileFetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (userProfile) {
          // Store user info in localStorage
          localStorage.setItem('userId', userProfile.id)
          localStorage.setItem('username', userProfile.username)

          setMessage('Account created successfully! Redirecting to lobby...')
          
          // Navigate to lobby
          setTimeout(() => {
            router.push('/lobby')
          }, 1500)
        } else {
          // If profile isn't found immediately (e.g. if email confirmation is required),
          // we still consider it a success but inform the user
          console.log('Profile not explicitly found immediately (likely email confirmation needed):', profileFetchError)
          setMessage('Account created! Please check your email to confirm.')
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      let errorMessage = err.message || 'Failed to create account. Please try again.'
      
      // Customize specific error messages
      if (errorMessage.includes('Database error')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.'
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please login instead.'
      }

      setError(errorMessage)
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

        {/* Toggle between Login and Signup */}
        <div className="flex mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => {
              setIsLogin(true)
              setError('')
              setMessage('')
            }}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              isLogin
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false)
              setError('')
              setMessage('')
            }}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              !isLogin
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
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
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
              {message}
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
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? 'Login' : 'Create Account'
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
