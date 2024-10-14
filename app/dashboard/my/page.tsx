'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PlusIcon, TrashIcon, CircleStackIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'

// Функция для объединения классов
function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

// Интерфейсы для типов данных
interface Graph {
  id: number
  timestamp: string
  prompt: string
  graph_html: string // base64
  is_up_to_date: boolean
}

interface DashboardData {
  display_name: string
  data: Array<Record<string, any>>
  columns: Array<string>
  descriptions: Record<string, string>
  graphs: Array<Graph>
}

// Предварительно закодированные тестовые данные
const TEST_DASHBOARD_DATA: DashboardData[] = [
  {
    display_name: 'Отчет о компании Б',
    data: [
      { column1: 'Value 1', column2: 'Value 2' },
      { column1: 'Value 3', column2: 'Value 4' },
    ],
    columns: ['column1', 'column2'],
    descriptions: {
      column1: 'Описание столбца 1',
      column2: 'Описание столбца 2',
    },
    graphs: [
      {
        id: 1,
        timestamp: '2024-04-01T12:00:00Z',
        prompt: 'График выручки',
        graph_html: 'PGRpdj4gSGFja2dyYXBoaWMgV3l1cmFja2kgPC9kaXY+', // <div>График Выручки</div>
        is_up_to_date: true,
      },
      {
        id: 2,
        timestamp: '2024-04-02T12:00:00Z',
        prompt: 'График прибыли',
        graph_html: 'PGRpdj4gSGFja2dyYXBoaWMgUGlyaWJpPC9kaXY+', // <div>График Прибыли</div>
        is_up_to_date: false,
      },
    ],
  },
  {
    display_name: 'Проекты в работе',
    data: [
      { column1: 'Проект A', column2: 'Завершен' },
      { column1: 'Проект B', column2: 'В процессе' },
    ],
    columns: ['column1', 'column2'],
    descriptions: {
      column1: 'Название проекта',
      column2: 'Статус',
    },
    graphs: [
      {
        id: 3,
        timestamp: '2024-04-03T12:00:00Z',
        prompt: 'График статусов проектов',
        graph_html: 'PGRpdj4gSGFja2dyYXBoaWMgU3RhdHVzPC9kaXY+', // <div>График Статусов Проектов</div>
        is_up_to_date: true,
      },
    ],
  },
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
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null)

  // Получение данных дэшборда при монтировании компонента
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/all_dashboards`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data: DashboardData[] = response.data
      if (data.length === 0) {
        // Если данные пустые, используем тестовые данные
        setDashboardData(TEST_DASHBOARD_DATA)
      } else {
        setDashboardData(data)
      }
    } catch (err: any) {
      console.error(err)
      // В случае ошибки используем тестовые данные и показываем уведомление
      setDashboardData(TEST_DASHBOARD_DATA)
      setNotification({ type: 'error', message: 'Ошибка при загрузке данных дэшборда.' })
    } finally {
      setIsLoading(false)
    }
  }

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
  const handleAddMetric = async () => {
    // Логика отправки данных на сервер или другая обработка
    try {
      const payload = {
        section: currentSection,
        metric_name: metricName,
        start_period: startPeriod,
        end_period: endPeriod,
        source: source,
      }

      const response = await axios.post(`${API_BASE_URL}/add_metric`, payload)

      if (response.status === 200) {
        setNotification({ type: 'success', message: 'Показатель успешно добавлен.' })
        await fetchDashboardData()
        closeAddMetricModal()
      } else {
        throw new Error('Не удалось добавить показатель.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка при добавлении показателя.' })
    }
  }

  // Обработчик удаления графика
  const handleDeleteGraph = async (graphId: number, displayName: string) => {
    const confirmed = confirm('Вы действительно хотите удалить этот график?')
    if (!confirmed) return

    try {
      const response = await axios.post(`${API_BASE_URL}/delete_graph`, {
        graph_id: graphId,
        display_name: displayName,
      })

      if (response.status === 200 && response.data.status === 'success') {
        setNotification({ type: 'success', message: response.data.message })
        await fetchDashboardData()
      } else {
        throw new Error(response.data.message || 'Не удалось удалить график.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Что-то пошло не так.' })
    }
  }

  // Обработчик обновления графика
  const handleRefreshGraph = async (graphId: number, displayName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/refresh_graph`, {
        graph_id: graphId,
        display_name: displayName,
      })

      if (response.status === 200 && response.data.status === 'success') {
        setNotification({ type: 'success', message: response.data.message })
        await fetchDashboardData()
      } else {
        throw new Error(response.data.message || 'Не удалось обновить график.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Что-то пошло не так.' })
    }
  }

  // Автоматически скрывать уведомление через 5 секунд
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification])

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
            {/* Уведомления */}
            {notification && (
              <div className="mt-4">
                <div
                  className={`rounded-md p-4 ${
                    notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <div className="flex">
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Обработка состояния загрузки */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Загрузка данных...</p>
              </div>
            )}

            {/* Отображение данных дэшборда */}
            {!isLoading && dashboardData.map((section) => (
              <section key={section.display_name} className="mt-12">
                <div className="mt-2 md:flex md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                      {section.display_name}
                    </h2>
                  </div>
                  <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
                    <button
                      type="button"
                      onClick={() => openAddMetricModal(section.display_name)}
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <PlusIcon aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Отображение графиков */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.graphs.length > 0 ? (
                    section.graphs.map((graph) => (
                      <div key={graph.id} className="relative bg-white p-4 rounded-lg shadow flex flex-col">
                        {/* Кнопка удаления графика */}
                        <button
                          onClick={() => handleDeleteGraph(graph.id, section.display_name)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          aria-label="Удалить график"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>

                        {/* Кнопка обновления графика */}
                        <button
                          onClick={() => handleRefreshGraph(graph.id, section.display_name)}
                          className="absolute top-2 left-2 text-indigo-500 hover:text-indigo-700"
                          aria-label="Обновить график"
                        >
                          <CircleStackIcon className="h-5 w-5" />
                        </button>

                        {/* Отображение графика через iframe */}
                        <div className="flex-1">
                          <iframe
                            srcDoc={atob(graph.graph_html)}
                            style={{
                              width: '100%',
                              height: '500px', // Установленная фиксированная высота
                              border: 'none',
                              overflow: 'hidden',
                            }}
                            title={graph.prompt}
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>

                        <p className="mt-2 text-sm text-gray-500">{graph.prompt}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-4 text-gray-500">
                      Показатели отсутствуют. Нажмите на кнопку{' '}
                      <PlusIcon aria-hidden="true" className="inline h-5 w-5" /> справа, чтобы добавить.
                    </div>
                  )}
                </div>
              </section>
            ))}

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
                              {dashboardData.map((section) => (
                                <option key={section.display_name} value={section.display_name}>
                                  {section.display_name}
                                </option>
                              ))}
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
