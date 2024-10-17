// app/components/ClientWrapper.tsx
'use client'

import { AuthProvider } from '../app/context/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState } from 'react'

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <ProtectedRoute>
        <Navbar setSidebarOpen={setSidebarOpen} />
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="lg:pl-72">{children}</main>
      </ProtectedRoute>
    </AuthProvider>
  )
}
