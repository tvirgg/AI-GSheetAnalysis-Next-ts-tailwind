'use client'

import { useState } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

interface Tab {
  name: string;
  href: string;
  current: boolean;
}

const tabs: Array<Tab> = [
  { name: 'Excel', href: '#', current: true },
  { name: 'Google таблицы', href: '#', current: false },
  { name: 'API (В разработке)', href: '#', current: false }
]

const people = [
  { name: 'Отчет о прибыли и убытках', title: 'Подключен к дашборду' },
  { name: 'Проекты в работе', title: 'Подключен к дашборду' },
]

export default function ReportsPage () {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>

        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="lg:pl-72">
          <Navbar setSidebarOpen={setSidebarOpen} />
          
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Page Start */}
              <div>
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Загрузить отчеты
                  </h2>
                  {/* <div className="mt-2 text-gray-700">
                    Мы поможем вам разобраться в Панельке и начать работу с ней всего за 3 шага
                  </div> */}
                </div>

                <div className="mt-10">
                  <div className="sm:hidden">
                    <label htmlFor="tabs" className="sr-only">
                      Select a tab
                    </label>
                    {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                    <select
                      id="tabs"
                      name="tabs"
                      defaultValue={tabs.find((tab) => tab.current)?.name}
                      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    >
                      {tabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden sm:block">
                    <div className="border-b border-gray-200">
                      <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                          <a
                            key={tab.name}
                            href={tab.href}
                            aria-current={tab.current ? 'page' : undefined}
                            className={classNames(
                              tab.current
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mt-6 flex gap-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <ArrowDownTrayIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                      Загрузить файл
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <DocumentIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                      Пример файла
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PlayCircleIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                      Видео инструкция
                    </button>
                  </div>
                </div>

                <div className="mt-8 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Тип отчета
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Статус
                              </th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Действия
                              </th>
                              {/* <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Edit</span>
                              </th> */}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {people.map((person, idx) => (
                              <tr key={idx}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {person.name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">{person.title}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6 flex gap-4">
                                  <a href="#" className="text-red-600">
                                    Удалить
                                  </a>

                                  <a href="#" className="text-red-700">
                                    Отключить от дашборда
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              {/* Page End */}

            </div>
          </main>
        </div>
      </div>
    </>
  )
}
