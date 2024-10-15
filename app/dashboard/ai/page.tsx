'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // Для перенаправления
import { API_BASE_URL } from 'baseapi/config' // Убедитесь, что путь правильный

export default function SigninPage() {
  const [message, setMessage] = useState<string>('') // Состояние для сообщений
  const [isLoading, setIsLoading] = useState<boolean>(false) // Состояние для загрузки
  const router = useRouter() // Для перенаправления

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    console.log('Login function called')

    // Используем FormData для получения данных формы
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('Email:', email)
    console.log('Password:', password)
    console.log('API_BASE_URL:', API_BASE_URL)

    try {
      // Запрос на аутентификацию
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('Login Response Status:', loginResponse.status)

      const loginResult = await loginResponse.json()
      console.log('Login Response:', loginResult)

      if (loginResponse.ok && loginResult.token) {
        // Сохранение токена в localStorage
        localStorage.setItem('token', loginResult.token)

        // Запрос к /user для получения данных пользователя
        const userResponse = await fetch(`${API_BASE_URL}/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginResult.token}` // Предполагая, что API использует Bearer Token
          }
        })

        console.log('User Response Status:', userResponse.status)

        const userResult = await userResponse.json()
        console.log('User Response:', userResult)

        if (userResponse.ok && userResult.user_data) {
          // Здесь вы можете сохранить данные пользователя в состоянии или контексте
          console.log('User Data:', userResult.user_data)
          setMessage('Вход выполнен успешно!')
          // Перенаправление пользователя на защищённую страницу
          router.push('/dashboard') // Замените '/dashboard' на нужный путь
        } else {
          setMessage(userResult.message || 'Не удалось получить данные пользователя.')
        }
      } else {
        setMessage(loginResult.message || 'Ошибка при входе.')
      }
    } catch (error) {
      console.error('Ошибка входа:', error)
      setMessage('Произошла ошибка. Пожалуйста, попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div>
            <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">Вход в Панельку</h2>
            <div>Полноценный доступ к работе с сервисом</div>
          </div>

          {/* Отображение сообщений */}
          {message && (
            <div id="message" className={`mt-4 text-center text-sm ${message === 'Вход выполнен успешно!' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={login} className="mt-6 space-y-6">
            <div>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ваш email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ваш пароль"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-900">
                  Запомнить меня
                </label>
              </div>

              <div className="text-sm leading-6">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Забыли пароль?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </div>
          </form>

          <div>
            <div className="relative mt-10">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-900">Или войти через</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => { /* Реализуйте логику Google авторизации */ }}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  {/* SVG содержимое */}
                </svg>
                <span className="text-sm font-semibold leading-6">Google</span>
              </button>

              {/* Аналогично для GitHub или других провайдеров */}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Еще не зарегистрированы?{' '}
          <Link href="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Пройти регистрацию
          </Link>
        </p>
      </div>
    </div>
  )
}
