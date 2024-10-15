'use client'

import { useState } from 'react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/app/api/config' // Исправленный импорт

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username: name, password: 'defaultPassword' }) // Замените 'defaultPassword' на реальное значение
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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <div>
              <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">Регистрация в Панельку</h2>
              <div>Полноценный доступ к работе с сервисом</div>
            </div>

            {/* Отображение сообщений */}
            {message && (
              <div id="message" className={`mt-4 text-center text-sm ${message.includes('успешно') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            <form onSubmit={register} className="mt-6 space-y-6">
              {/* Поля ввода */}
              <div>
                <div className="mt-2">
                  <input
                    name="name"
                    type="text"
                    placeholder="Как вас зовут?"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mt-2">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Добавьте поле для пароля, если оно требуется вашим API */}
              <div>
                <div className="mt-2">
                  <input
                    name="password"
                    type="password"
                    placeholder="Пароль"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm"
                    value={'defaultPassword'} // Замените на реальное значение, если нужно
                    onChange={(e) => {/* Обработчик изменения пароля */}}
                  />
                </div>
              </div>

              {/* Кнопка регистрации */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                Регистрируясь, вы даете согласие на {' '}
                <a href="#" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-500">обработку персональных данных</a>
                {' '} и принимаете условия {' '}
                <a href="#" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-500">лицензионного соглашения</a>
              </p>

            </form>

            {/* Остальная часть вашего кода */}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Уже зарегистрированы?{' '}
            <Link href="/signin" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Войти в аккаунт
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
