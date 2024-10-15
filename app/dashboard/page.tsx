// app/dashboard/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      // Если токена нет, перенаправляем на страницу входа
      router.push('/signin')
    }
    // Иначе продолжаем отображать страницу
  }, [])

  return (
    <div>
      {/* Содержимое защищенной страницы */}
      <h1>Добро пожаловать в дашборд!</h1>
    </div>
  )
}
