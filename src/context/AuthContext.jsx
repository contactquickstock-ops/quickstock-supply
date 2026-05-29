import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Network unavailable on startup — stop loading so user sees the login screen
        setLoading(false)
        return
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          // On a fresh sign-in, hold ProtectedRoute in loading state until
          // the profile is fetched — prevents a premature redirect to /login
          if (event === 'SIGNED_IN') setLoading(true)
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (!error) setProfile(data)
    setLoading(false)

    // Show welcome toast on the destination page, not the login page
    const name = sessionStorage.getItem('auth_welcome')
    if (name) {
      sessionStorage.removeItem('auth_welcome')
      toast.success(`Welcome back, ${name}! 👋`)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  function refreshProfile() {
    if (user) fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)