// app/dashboard/page.tsx
'use client'

import ProtectedRoute from '../../components/ProtectedRoute' // Adjust the import path

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Добро пожаловать в дашборд!</h1>
        {/* Ваш контент */}
      </div>
    </ProtectedRoute>
  )
}
