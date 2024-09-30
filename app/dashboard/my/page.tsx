'use client'

import { useState } from 'react'
import {
  PlusIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function MyDashboard () {
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
              <div className="flex items-center flex-col">
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Дашборд
                  </h2>
                  {/* <div className="mt-2 text-gray-700">
                    Мы поможем вам разобраться в Панельке и начать работу с ней всего за 3 шага
                  </div> */}
                </div>

                <div>
                  <form className="mt-10 max-w-md min-w-[500px]">
                    <label htmlFor="q" className="block text-sm font-medium leading-6 text-gray-900">
                      Что вы хотите узнать?
                    </label>
                    <div className="flex gap-x-4">
                      <input
                        name="q"
                        type="text"
                        required
                        placeholder="Какие показатели ухудшились в этом месяце?"
                        className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      <button
                        type="submit"
                        className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Узнать
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="mt-20 flex gap-4 w-full justify-center">
                <button
                  type="button"
                  className="w-[100px] rounded-full bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  7 дней
                </button>
                <button
                  type="button"
                  className="w-[100px] rounded-full bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Месяц
                </button>
                <button
                  type="button"
                  className="w-[100px] rounded-full bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Год
                </button>
              </div>

              <section className="mt-12">
                <div className="mt-2 md:flex md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                      Финансы
                    </h2>
                  </div>
                  <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PlusIcon aria-hidden="true" className=" h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <picture>
                    <img src="/temp/1-graph.png" className="max-w-[630px] w-full" alt="" />
                  </picture>

                  <picture>
                    <img src="/temp/1-graph.png" className="max-w-[630px] w-full" alt="" />
                  </picture>

                  <picture>
                    <img src="/temp/1-graph.png" className="max-w-[630px] w-full" alt="" />
                  </picture>
                </div>
              </section>

              <section className="mt-12">
                <div className="mt-2 md:flex md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                      Продажи
                    </h2>
                  </div>
                  <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PlusIcon aria-hidden="true" className=" h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <picture>
                    <img src="/temp/3-graph.png" className="max-w-[630px] w-full" alt="" />
                  </picture>
                </div>
              </section>

              <section className="mt-12">
                <div className="mt-2 md:flex md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                      Маркетинг
                    </h2>
                  </div>
                  <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PlusIcon aria-hidden="true" className=" h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="p-4 text-gray-500">Показатели отсутствуют. Нажмите на кнопку <PlusIcon aria-hidden="true" className="inline h-5 w-5" /> с права чтобы добавить</p>
                </div>
              </section>

              {/* Page End */}

            </div>
          </main>
        </div>
      </div>
    </>
  )
}
