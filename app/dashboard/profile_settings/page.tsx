// app/dashboard/profile_settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { UserIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config' // Используем новый алиас
import { useAuth } from '@/app/context/AuthContext'

interface UserProfile {
  id: number
  email: string
  username: string
  auth_type: string
}

export default function ProfilePage() {
  const { token, user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({ ...user, auth_type: '' }) // Добавляем значение для auth_type
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return
    const { name, value } = e.target
    setProfile({ ...profile, [name]: value })
  }

  const handleSaveChanges = async () => {
    if (!profile) return
    setIsLoading(true)
    try {
      const response = await axios.put(`${API_BASE_URL}/user`, profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.status === 200) {
        setIsEditing(false)
        alert('Профиль успешно обновлен!')
      }
    } catch (err) {
      console.error('Ошибка при сохранении профиля:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Sidebar sidebarOpen={false} setSidebarOpen={() => {}} />
      <div className="lg:pl-72">
        <Navbar setSidebarOpen={() => {}} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-6 max-w-3xl mx-auto bg-white shadow sm:rounded-lg p-6">
              {isLoading ? (
                <p>Загрузка...</p>
              ) : (
                <>
                  {!isEditing ? (
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                        <span className="ml-3 text-gray-700">{profile?.username}</span>
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                        <span className="ml-3 text-gray-700">{profile?.email}</span>
                      </div>
                      {/* Добавьте другие поля по необходимости */}
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
                      >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Изменить
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-6">
                      {/* Имя пользователя */}
                      <div className="flex items-center">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                        <input
                          type="text"
                          name="username"
                          value={profile?.username || ''}
                          onChange={handleInputChange}
                          className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Имя пользователя"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex items-center">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={profile?.email || ''}
                          onChange={handleInputChange}
                          className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Email"
                        />
                      </div>

                      {/* Кнопки */}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow-sm"
                        >
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-md shadow-sm"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
