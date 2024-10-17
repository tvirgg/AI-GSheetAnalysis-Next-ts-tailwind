'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../app/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push('/signin')
    }
  }, [token, router])

  if (!token) {
    return null // Если нет токена, ничего не рендерим
  }

  return <>{children}</>
}

export default ProtectedRoute
