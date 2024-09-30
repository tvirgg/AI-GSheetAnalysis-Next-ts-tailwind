'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react'
import {
  AcademicCapIcon,
  ArrowLeftStartOnRectangleIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeIcon,
  Squares2X2Icon,
  XMarkIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Дашборд', href: '/dashboard/my', icon: HomeIcon, current: false },
  { name: 'Отчеты', href: '/dashboard/reports', icon: ChartPieIcon, current: false },
  { name: 'Аишка', href: '/dashboard/ai', icon: ViewfinderCircleIcon, current: false },
]

const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar ({ sidebarOpen = false, setSidebarOpen = f => f }) {
  return (
    <>
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
              <div className="flex text-gray-200 mt-6">
                <Squares2X2Icon aria-hidden="true" className="h-10 w-10" />
                <div className="flex-1 ml-2">
                  <div className="font-bold text-sm">Company name</div>
                  <div className="text-sm">Денис</div>
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
                            // 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'bg-gray-200 text-gray-900',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
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
                          <a
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            )}
                          >
                            <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                            {item.name}
                          </a>
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
                    <a
                      href="#"
                      className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                      onClick={() => signOut()}
                    >
                      <ArrowLeftStartOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                      Выйти
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          <div className="flex text-gray-200 mt-6">
            <Squares2X2Icon aria-hidden="true" className="h-10 w-10" />
            <div className="flex-1 ml-2">
              <div className="font-bold text-sm">Company name</div>
              <div className="text-sm">Денис</div>
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
                        // 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'bg-gray-200 text-gray-900',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
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
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
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
                <a
                  href="#"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                  onClick={() => signOut()}
                >
                  <ArrowLeftStartOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                  Выйти
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}