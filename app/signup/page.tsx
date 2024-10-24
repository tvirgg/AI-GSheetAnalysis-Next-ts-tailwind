// app/signup/page.tsx
'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from 'baseapi/config' // Используем новый алиас

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('') // Добавлено состояние для company_name
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, company_name: companyName }) // Включено company_name
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Регистрация прошла успешно!')
        router.push('/signin')
      } else {
        setMessage(data.message || 'Ошибка при регистрации.')
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      setMessage('Произошла ошибка. Пожалуйста, попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div>
            <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">Регистрация в Панельку</h2>
            <p className="mt-2 text-sm text-gray-600">Полноценный доступ к работе с сервисом</p>
          </div>

          {/* Отображение сообщений */}
          {message && (
            <div className={`mt-4 text-center text-sm ${message.includes('успешно') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={register} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="sr-only">Как вас зовут?</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Как вас зовут?"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Пароль"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Новое поле для названия компании */}
            <div>
              <label htmlFor="company_name" className="sr-only">Название компании</label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="Название компании"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Запомнить меня
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Забыли пароль?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Или войти через</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              {/* Реализуйте кнопки для социальных логинов, если необходимо */}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Уже зарегистрированы?{' '}
          <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Войти в аккаунт
          </Link>
        </p>
      </div>
    </div>
  )
}
