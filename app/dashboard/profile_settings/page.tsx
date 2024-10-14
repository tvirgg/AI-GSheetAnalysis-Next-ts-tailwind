'use client'

import { useState, useEffect } from 'react'
import { UserIcon, KeyIcon, PhotoIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  password: string
  profilePicture: string
}

const initialProfile = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  profilePicture: '',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`)
      setProfile(response.data)
    } catch (err) {
      console.error('Ошибка при загрузке профиля:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile({ ...profile, [name]: value })
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      const response = await axios.put(`${API_BASE_URL}/profile`, profile)
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
      <Sidebar />
      <div className="lg:pl-72">
        <Navbar />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-6 max-w-3xl mx-auto bg-white shadow sm:rounded-lg">
              {isLoading ? (
                <p>Загрузка...</p>
              ) : (
                <form className="space-y-6">
                  {/* Имя */}
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Имя"
                    />
                  </div>

                  {/* Фамилия */}
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Фамилия"
                    />
                  </div>

                  {/* Почта */}
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Почта"
                    />
                  </div>

                  {/* Пароль */}
                  <div className="flex items-center">
                    <KeyIcon className="h-6 w-6 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={profile.password}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Пароль"
                    />
                  </div>

                  {/* Фото профиля */}
                  <div className="flex items-center">
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                    <input
                      type="text"
                      name="profilePicture"
                      value={profile.profilePicture}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Ссылка на фото"
                    />
                  </div>

                  {/* Кнопки */}
                  <div className="flex justify-between">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={handleSaveChanges}
                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow-sm"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Сохранить
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
                      >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Изменить
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
