'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  PlusIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

// Функция для объединения классов
function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

// Интерфейс для вкладок (если используется)
interface Tab {
  name: string
  href: string
  current: boolean
}

// Данные для вкладок (если используются)
const tabs: Array<Tab> = [
  { name: 'Excel', href: '#', current: true },
  { name: 'Google таблицы', href: '#', current: false },
  { name: 'API (В разработке)', href: '#', current: false },
]

// Данные для таблицы (если используются)
const people = [
  { name: 'Отчет о прибыли и убытках', title: 'Подключен к дашборду' },
  { name: 'Проекты в работе', title: 'Подключен к дашборду' },
]

export default function MyDashboard() {
  // Состояния для управления компонентом
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState<string>('')
  const [metricName, setMetricName] = useState('')
  const [startPeriod, setStartPeriod] = useState('')
  const [endPeriod, setEndPeriod] = useState('')
  const [source, setSource] = useState('')

  // Обработчик открытия модального окна для добавления показателя
  const openAddMetricModal = (section: string) => {
    setCurrentSection(section)
    setIsAddMetricOpen(true)
  }

  // Обработчик закрытия модального окна
  const closeAddMetricModal = () => {
    setIsAddMetricOpen(false)
    setMetricName('')
    setStartPeriod('')
    setEndPeriod('')
    setSource('')
    setCurrentSection('')
  }

  // Обработчик добавления показателя
  const handleAddMetric = () => {
    // Логика отправки данных на сервер или другая обработка
    console.log('Добавлен показатель:', {
      section: currentSection,
      metricName,
      startPeriod,
      endPeriod,
      source,
    })

    // После успешного добавления закрываем модальное окно
    closeAddMetricModal()
  }

  return (
    <div>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-72">
        {/* Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Основной контент страницы */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Заголовок страницы */}
            <div className="flex items-center flex-col">
              <div>
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                  Дашборд
                </h2>
                {/* Дополнительный текст (закомментирован) */}
                {/* <div className="mt-2 text-gray-700">
                  Мы поможем вам разобраться в Панельке и начать работу с ней всего за 3 шага
                </div> */}
              </div>

              {/* Форма поиска или другого взаимодействия */}
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

            {/* Кнопки периода */}
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

            {/* Секция Финансы */}
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
                    onClick={() => openAddMetricModal('Финансы')}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon aria-hidden="true" className=" h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <picture>
                  <img src="/temp/1-graph.png" className="max-w-[630px] w-full" alt="Финансы график 1" />
                </picture>

                <picture>
                  <img src="/temp/1-graph.png" className="max-w-[630px] w-full" alt="Финансы график 2" />
                </picture>

                <picture>
                  <img src="/temp/1-graph.png" className="max-w-[630px] w-full" alt="Финансы график 3" />
                </picture>
              </div>
            </section>

            {/* Секция Продажи */}
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
                    onClick={() => openAddMetricModal('Продажи')}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon aria-hidden="true" className=" h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <picture>
                  <img src="/temp/3-graph.png" className="max-w-[630px] w-full" alt="Продажи график" />
                </picture>
              </div>
            </section>

            {/* Секция Маркетинг */}
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
                    onClick={() => openAddMetricModal('Маркетинг')}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon aria-hidden="true" className=" h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="p-4 text-gray-500">
                  Показатели отсутствуют. Нажмите на кнопку{' '}
                  <PlusIcon aria-hidden="true" className="inline h-5 w-5" /> с права чтобы добавить
                </p>
              </div>
            </section>

            {/* Модальное окно для добавления показателя */}
            <Transition.Root show={isAddMetricOpen} as={Fragment}>
              <Dialog as="div" className="relative z-10" onClose={closeAddMetricModal}>
                {/* Затемняющий фон */}
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

                {/* Контейнер модального окна */}
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
                      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        {/* Заголовок модального окна */}
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 font-medium text-gray-900 text-center"
                        >
                          Какой показатель вы хотите добавить?
                        </Dialog.Title>
                        <div className="mt-5">
                          {/* Поле ввода названия показателя */}
                          <div className="mb-4">
                            <label htmlFor="metricName" className="block text-sm font-medium text-gray-700">
                              Название показателя
                            </label>
                            <input
                              id="metricName"
                              type="text"
                              required
                              placeholder="Например, выручка, прибыль, проданные товары"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={metricName}
                              onChange={(e) => setMetricName(e.target.value)}
                            />
                          </div>

                          {/* Выбор периода */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              За какой период отразить показатель
                            </label>
                            <div className="mt-1 grid grid-cols-2 gap-4">
                              {/* Начало периода */}
                              <div>
                                <label htmlFor="startPeriod" className="block text-sm font-medium text-gray-700">
                                  Начало периода
                                </label>
                                <input
                                  id="startPeriod"
                                  type="date"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  value={startPeriod}
                                  onChange={(e) => setStartPeriod(e.target.value)}
                                />
                              </div>
                              {/* Конец периода */}
                              <div>
                                <label htmlFor="endPeriod" className="block text-sm font-medium text-gray-700">
                                  Конец периода
                                </label>
                                <input
                                  id="endPeriod"
                                  type="date"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  value={endPeriod}
                                  onChange={(e) => setEndPeriod(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Выбор источника */}
                          <div className="mb-4">
                            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                              Источники для расчета показателя
                            </label>
                            <select
                              id="source"
                              className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={source}
                              onChange={(e) => setSource(e.target.value)}
                            >
                              <option value="">Выберите источник</option>
                              <option value="Отчет о прибыли и убытках">Отчет о прибыли и убытках</option>
                              <option value="Проекты в работе">Проекты в работе</option>
                              {/* Добавьте другие источники по необходимости */}
                            </select>
                          </div>

                          {/* Кнопка добавления показателя */}
                          <div className="mt-5 sm:mt-6">
                            <button
                              type="button"
                              disabled={!metricName || !startPeriod || !endPeriod || !source}
                              className={classNames(
                                metricName && startPeriod && endPeriod && source
                                  ? 'bg-indigo-600 hover:bg-indigo-700'
                                  : 'bg-indigo-300 cursor-not-allowed',
                                'w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm'
                              )}
                              onClick={handleAddMetric}
                            >
                              Добавить показатель
                            </button>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            {/* Конец модального окна */}
          </div>
        </main>
      </div>
    </div>
  )
}
