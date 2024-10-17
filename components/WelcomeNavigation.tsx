// app/components/WelcomeNavigation.tsx
'use client'

import Link from 'next/link'

export default function WelcomeNavigation() {
  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип или название компании */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-xl">
              Моя Компания
            </Link>
          </div>

          {/* Ссылки навигации */}
          <div className="hidden md:flex space-x-4">
            <Link
              href="/signin"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Вход
            </Link>
            <Link
              href="/signup"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Регистрация
            </Link>
          </div>

          {/* Мобильное меню */}
          <div className="-mr-2 flex md:hidden">
            {/* Здесь можно добавить кнопку для открытия мобильного меню */}
          </div>
        </div>
      </div>
    </nav>
  )
}
