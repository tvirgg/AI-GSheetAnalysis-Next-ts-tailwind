// app/profile/page.tsx
'use client'

import { useState, useEffect, Fragment } from 'react'
import { UserIcon, AtSymbolIcon, BuildingOfficeIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'
import { Dialog, Transition } from '@headlessui/react'

interface UserProfile {
  id: number
  email: string
  username: string
  auth_type: string
  company_name: string
}

export default function ProfilePage() {
  const { token, user, logout, login } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Состояния для каждого поля редактирования
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingCompany, setIsEditingCompany] = useState(false)

  // Состояния для значений полей
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')

  // Состояния для изменения пароля
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isPasswordChanging, setIsPasswordChanging] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({ ...user, auth_type: user.auth_type, company_name: user.company_name || '' })
      setUsername(user.username)
      setEmail(user.email)
      setCompanyName(user.company_name || '')
    }
  }, [user])

  // Функция для сохранения изменений в поле
  const handleSaveChange = async (field: 'username' | 'email' | 'company_name') => {
    if (!profile) return

    let payload: any = {}
    if (field === 'username' && username !== profile.username) {
      payload.new_username = username
    }
    if (field === 'email' && email !== profile.email) {
      payload.new_email = email
    }
    if (field === 'company_name' && companyName !== profile.company_name) {
      payload.new_company_name = companyName
    }

    // Если нет изменений, выходим
    if (Object.keys(payload).length === 0) {
      alert('Нет изменений для сохранения.')
      return
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/edit_user`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.status === 200) {
        alert('Профиль успешно обновлен!')
        // Обновляем данные пользователя в контексте
        login(token!) // Предполагается, что после обновления сервер возвращает обновленный токен или данные пользователя
        // В зависимости от реализации AuthContext, возможно, нужно вызвать fetchUserData или другой метод для обновления
        setProfile(response.data.user_data)
        // Выход из режима редактирования
        if (field === 'username') setIsEditingUsername(false)
        if (field === 'email') setIsEditingEmail(false)
        if (field === 'company_name') setIsEditingCompany(false)
      }
    } catch (err: any) {
      console.error(`Ошибка при обновлении ${field}:`, err)
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Ошибка: ${err.response.data.message}`)
      } else {
        alert('Не удалось сохранить изменения. Пожалуйста, попробуйте снова.')
      }
    }
  }

  // Функция для смены пароля
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Пожалуйста, заполните все поля.')
      return
    }

    setIsPasswordChanging(true)

    try {
      const response = await axios.put(`${API_BASE_URL}/edit_user`, {
        new_password: newPassword,
        current_password: currentPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 200) {
        alert('Пароль успешно изменен!')
        setIsPasswordModalOpen(false)
        setCurrentPassword('')
        setNewPassword('')
      }
    } catch (err: any) {
      console.error('Ошибка при смене пароля:', err)
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Ошибка: ${err.response.data.message}`)
      } else {
        alert('Не удалось изменить пароль. Пожалуйста, попробуйте снова.')
      }
    } finally {
      setIsPasswordChanging(false)
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
              {!profile ? (
                <p>Загрузка...</p>
              ) : (
                <div className="space-y-6">
                  {/* Имя пользователя */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-6 w-6 text-blue-500" />
                      {!isEditingUsername ? (
                        <span className="ml-3 text-gray-700">{profile.username}</span>
                      ) : (
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      )}
                    </div>
                    <div>
                      {!isEditingUsername ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingUsername(true)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveChange('username')}
                            className="text-green-500 hover:text-green-700 mr-2"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingUsername(false)
                              setUsername(profile.username)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AtSymbolIcon className="h-6 w-6 text-green-500" />
                      {!isEditingEmail ? (
                        <span className="ml-3 text-gray-700">{profile.email}</span>
                      ) : (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      )}
                    </div>
                    <div>
                      {!isEditingEmail ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(true)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveChange('email')}
                            className="text-green-500 hover:text-green-700 mr-2"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingEmail(false)
                              setEmail(profile.email)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Название компании */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-purple-500" />
                      {!isEditingCompany ? (
                        <span className="ml-3 text-gray-700">{profile.company_name}</span>
                      ) : (
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      )}
                    </div>
                    <div>
                      {!isEditingCompany ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingCompany(true)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveChange('company_name')}
                            className="text-green-500 hover:text-green-700 mr-2"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCompany(false)
                              setCompanyName(profile.company_name)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Кнопка для смены пароля */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Сменить пароль
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Модальное окно для смены пароля */}
      <Transition.Root show={isPasswordModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setIsPasswordModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Смена пароля
                      </Dialog.Title>
                      <div className="mt-4">
                        <div className="flex flex-col mb-4">
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Текущий пароль
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Введите текущий пароль"
                            className="mt-1 p-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            Новый пароль
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Введите новый пароль"
                            className="mt-1 p-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      disabled={isPasswordChanging}
                      onClick={handleChangePassword}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isPasswordChanging ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
