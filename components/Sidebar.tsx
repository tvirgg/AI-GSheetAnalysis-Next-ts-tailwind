// components/Sidebar.tsx
'use client'

import { useAuth } from '@/app/context/AuthContext'
import { Dialog, Transition } from '@headlessui/react'
import {
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon,
  ChartPieIcon,
  CreditCardIcon,
  HomeIcon,
  Squares2X2Icon,
  XMarkIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Fragment, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'

const navigation = [
  { name: 'Дашборд', href: '/dashboard/my', icon: HomeIcon },
  { name: 'Отчеты', href: '/dashboard/reports', icon: ChartPieIcon },
  { name: 'Аишка', href: '/dashboard/ai', icon: ViewfinderCircleIcon },
]

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  const { token, logout, user } = useAuth()
  const router = useRouter()
  const userName = user?.username || 'Пользователь'

  useEffect(() => {
    if (!token) {
      router.push('/signin')
    }
  }, [token, router])

  if (!token) {
    return null
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          {/* Sidebar content */}
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs sm:max-w-sm flex-1 transform bg-gray-900 p-6 overflow-hidden">
                {/* Close button */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-white"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto">
                  <div className="flex text-gray-200 mt-6">
                    <Squares2X2Icon aria-hidden="true" className="h-10 w-10" />
                    <div className="flex-1 ml-2">
                      <div className="font-bold text-sm">Company name</div>
                      <div className="text-sm">{userName}</div>
                    </div>
                  </div>

                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          <li>
                            <Link
                              href="/dashboard"
                              className={classNames(
                                'bg-gray-200 text-gray-900',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6'
                              )}
                            >
                              <AcademicCapIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                              <div>
                                <div className="font-semibold">Как начать работу?</div>
                                <div className="underline italic text-xs">за 3 шага &rarr;</div>
                              </div>
                            </Link>
                          </li>
                        </ul>
                      </li>

                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={classNames(
                                  'text-gray-400 hover:bg-gray-800 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                                )}
                              >
                                <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>

                      <li className="mt-auto">
                        <a
                          href="#"
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                          <CreditCardIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                          Оформить подписку
                        </a>
                        <button
                          type="button"
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                          onClick={() => logout()}
                        >
                          <ArrowLeftOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                          Выйти
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          <div className="flex text-gray-200 mt-6">
            <Squares2X2Icon aria-hidden="true" className="h-10 w-10" />
            <div className="flex-1 ml-2">
              <div className="font-bold text-sm">Company name</div>
              <div className="text-sm">{userName}</div>
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link
                      href="/dashboard"
                      className={classNames(
                        'bg-gray-200 text-gray-900',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6'
                      )}
                    >
                      <AcademicCapIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                      <div>
                        <div className="font-semibold">Как начать работу?</div>
                        <div className="underline italic text-xs">за 3 шага &rarr;</div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          'text-gray-400 hover:bg-gray-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                        )}
                      >
                        <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="mt-auto">
                <a
                  href="#"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <CreditCardIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                  Оформить подписку
                </a>
                <button
                  type="button"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                  onClick={() => logout()}
                >
                  <ArrowLeftOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                  Выйти
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
