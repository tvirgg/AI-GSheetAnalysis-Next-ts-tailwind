// app/context/AuthContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from 'baseapi/config'

interface User {
  id: number
  email: string
  username: string
  auth_type: string
  company_name: string // Добавлено поле company_name
}

interface AuthContextType {
  token: string | null
  user: User | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUserData(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch user data')
      const data = await response.json()
      setUser(data.user_data)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      logoutUser()
    } finally {
      setLoading(false)
    }
  }

  const loginUser = async (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    await fetchUserData(newToken)
    router.push('/dashboard')
  }

  const logoutUser = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    router.push('/signin')
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login: loginUser, logout: logoutUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined)
    throw new Error('useAuth must be used within an AuthProvider')
  return context
}
