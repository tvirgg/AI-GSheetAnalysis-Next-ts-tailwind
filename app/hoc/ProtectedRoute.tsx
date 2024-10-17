// app/hoc/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext' // Убедитесь, что путь к AuthContext правильный

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
    return null // Или можно добавить индикатор загрузки
  }

  return <>{children}</>
}

export default ProtectedRoute
