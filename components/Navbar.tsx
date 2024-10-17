// app/components/Navbar.tsx
'use client'

import { useAuth } from '../app/context/AuthContext'
import { Menu, Transition } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'
import classNames from 'classnames'

const userNavigation = [{ name: 'Настройки', href: '/dashboard/profile_settings' }]

export default function Navbar({ setSidebarOpen = (open: boolean) => {} }) {
  const { logout, user } = useAuth()

  const userName = user?.username || 'Пользователь' // Динамическое имя пользователя

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Кнопка для открытия бокового меню на мобильных устройствах */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
      >
        <span className="sr-only">Открыть боковое меню</span>
        <Bars3Icon aria-hidden="true" className="h-6 w-6" />
      </button>

      {/* Разделитель, видимый только на мобильных устройствах */}
      <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Здесь можно добавить поиск или другие элементы */}
        <div className="flex-1" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Выпадающее меню профиля */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">Открыть меню пользователя</span>
                {/* Отображение имени пользователя */}
                <span className="flex items-center">
                  {/* На мобильных устройствах отображаем инициалы или сокращённое имя */}
                  <span className="block lg:hidden text-sm font-semibold text-gray-900">
                    {userName.charAt(0)}
                  </span>
                  {/* На больших экранах отображаем полное имя */}
                  <span className="hidden lg:block ml-4 text-sm font-semibold text-gray-900">
                    {userName}
                  </span>
                  <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                </span>
              </Menu.Button>
            </div>

            {/* Меню, которое открывается при клике */}
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <a
                        href={item.href}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        {item.name}
                      </a>
                    )}
                  </Menu.Item>
                ))}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => logout()}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block w-full text-left px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      Выйти
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}
