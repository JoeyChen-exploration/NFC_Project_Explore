import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('lh_token')
    if (!token) { setLoading(false); return }
    api.me()
      .then(d => setUser(d.user))
      .catch(() => localStorage.removeItem('lh_token'))
      .finally(() => setLoading(false))
  }, [])

  function login(token, userData) {
    localStorage.setItem('lh_token', token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('lh_token')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
