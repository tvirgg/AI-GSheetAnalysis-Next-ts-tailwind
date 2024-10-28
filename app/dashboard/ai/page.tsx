'use client'

import { useState, useEffect, useRef, Fragment, KeyboardEvent } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDashboard } from '@/app/context/DashboardContext'

// Обновлённый интерфейс Graph с graph_id типа number
interface Graph {
  id: number
  graph_id: number // Изменено на тип number
  table_name: string
  graph_data: any // Можно уточнить тип при необходимости
  timestamp: number
  prompt: string
  graph_html: string // base64
  is_up_to_date: boolean
}

interface ChartResponse {
  status: string
  graph_html: string
  timestamp: number
  prompt: string
  message?: string
}

interface DashboardResponse {
  table_name: string
  display_name: string
  data: Array<{ [key: string]: any }>
  columns: string[]
  descriptions: { [key: string]: string }
  graphs: Graph[]
}

export default function AiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [tableName, setTableName] = useState<string>('') // Selected table
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // States for table modal
  const [tableData, setTableData] = useState<DashboardResponse | null>(null)
  const [tableLoading, setTableLoading] = useState<boolean>(false)
  const [tableError, setTableError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Ref for scrolling to the last graph
  const lastGraphRef = useRef<HTMLDivElement>(null)

  const { token: contextToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const { dashboardData, addGraph, deleteGraph, isLoading: dashboardLoading } = useDashboard()

  // Get token from localStorage
  const getTokenFromLocalStorage = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Use token from context or localStorage
  const token = contextToken || getTokenFromLocalStorage()

  useEffect(() => {
    if (!token) {
      router.replace('/signin') // Redirect to login page
    }
  }, [token, router])

  // Get table_name from query parameters
  const tableNameParam = searchParams.get('table_name')

  // Set selected table based on query parameter
  useEffect(() => {
    if (!token) return

    if (dashboardData.length > 0) {
      if (tableNameParam) {
        const foundTable = dashboardData.find((table) => table.table_name === tableNameParam)

        if (!foundTable) {
          setError('Указанный источник данных не найден.')
        } else {
          setTableName(foundTable.table_name)
          setGeneratedGraphs([]) // Clear any existing generated graphs
        }
      }
    }
  }, [dashboardData, token, tableNameParam])

  // Manage generated graphs separately
  const [generatedGraphs, setGeneratedGraphs] = useState<Graph[]>([])

  // Scroll to the last generated graph when a new graph is added
  useEffect(() => {
    if (lastGraphRef.current) {
      lastGraphRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [generatedGraphs])

  // Handle form submission
  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Пожалуйста, введите запрос.')
      return
    }

    if (!tableName) {
      setError('Пожалуйста, выберите источник данных.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/create_chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          table_name: tableName,
          chart_prompt: prompt,
        }),
      })

      const data: ChartResponse = await response.json()

      if (data.status === 'success') {
        // Создание нового графика с учётом обновлённого интерфейса
        const newGraph: Graph = {
          id: Date.now(), // Идентификатор графика
          graph_id: Date.now(), // Генерация уникального graph_id как number
          table_name: tableName, // Название таблицы
          graph_data: data.graph_html, // Используем graph_html как graph_data (можно изменить при необходимости)
          timestamp: data.timestamp,
          prompt: data.prompt,
          graph_html: data.graph_html,
          is_up_to_date: true,
        }

        // Добавление нового графика в контекст
        addGraph(tableName, newGraph)

        // Добавление нового графика в локальное состояние
        setGeneratedGraphs((prev) => [...prev, newGraph])

        setPrompt('')
        setError(null)
      } else {
        // Отображение сообщения об ошибке от API
        setError(data.message || 'Не удалось создать график.')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка.')
    } finally {
      setLoading(false)
    }
  }

  // Allow submitting the form by pressing Enter key
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Handle table display
  const handleToggleTable = async () => {
    if (!tableName) {
      setError('Пожалуйста, выберите таблицу.')
      return
    }

    setTableLoading(true)
    setTableError(null)
    setTableData(null)

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard?table_name=${encodeURIComponent(tableName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка при получении данных таблицы: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const data: DashboardResponse = await response.json()

      setTableData(data)
      setIsModalOpen(true) // Open the modal
    } catch (err: any) {
      setTableError(err.message || 'Произошла ошибка при получении данных таблицы.')
    } finally {
      setTableLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:pl-80">
          <Navbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 flex flex-col relative">
            {/* Graphs and Tables */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 mb-24 bg-gray-50">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Display generated graphs or suggested questions */}
                {generatedGraphs.length > 0 ? (
                  <div className="flex flex-col space-y-6">
                    {generatedGraphs.map((graph, index) => (
                      <div
                        key={graph.id}
                        ref={index === generatedGraphs.length - 1 ? lastGraphRef : null}
                      >
                        <div className="bg-white p-4 rounded-lg shadow relative">
                          {/* Control buttons */}
                          <div className="absolute top-2 right-2 flex space-x-2">
                            {/* Delete graph */}
                            <button
                              onClick={async () => {
                                const confirmDelete = window.confirm('Вы действительно хотите удалить этот график?')
                                if (!confirmDelete) return

                                try {
                                  await deleteGraph(graph.graph_id, tableName) // Используем graph_id
                                  // Remove the graph from generatedGraphs
                                  setGeneratedGraphs((prev) => prev.filter(g => g.graph_id !== graph.graph_id))
                                } catch (err: any) {
                                  setError(err.message || 'Произошла ошибка при удалении графика.')
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Удалить график"
                            >
                              {/* Delete icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <p className="text-sm text-gray-600 mb-2 ml-1">
                            <strong>Запрос:</strong> {graph.prompt}
                          </p>
                          <iframe
                            srcDoc={atob(graph.graph_html)}
                            style={{
                              width: '100%',
                              height: '500px',
                              border: 'none',
                              overflow: 'hidden',
                            }}
                            title={`Graph-${graph.id}`}
                            sandbox="allow-scripts allow-same-origin"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Создано: {new Date(graph.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Welcome message and suggested questions
                  <div className="flex flex-col h-full justify-center items-center space-y-6">
                    {/* Header Section */}
                    <div className="text-center">
                      <h1 className="font-semibold text-2xl">Аишка</h1>
                      <p className="mt-4">
                        Задавайте вопросы, чтобы получить информацию
                        <br />
                        о состоянии бизнеса и наиболее важных показателях
                      </p>
                    </div>
                    {/* Suggested Questions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div
                        className="p-10 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setPrompt('Какие показатели ухудшились в этом месяце?')
                        }
                      >
                        Какие показатели ухудшились в этом месяце?
                      </div>
                      <div
                        className="p-10 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setPrompt('Есть ли риск кассового разрыва?')
                        }
                      >
                        Есть ли риск кассового разрыва?
                      </div>
                      <div
                        className="p-10 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setPrompt('Какие мои товары имеют наибольшую маржу?')
                        }
                      >
                        Какие мои товары имеют наибольшую маржу?
                      </div>
                      <div
                        className="p-10 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setPrompt('Кто из продавцов не выполнил план в последнем месяце?')
                        }
                      >
                        Кто из продавцов не выполнил план в последнем месяце?
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed input area */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-80 z-50">
              {/* Container */}
              <div className="bg-gray-50">
                {/* Inner container */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 shadow-custom bg-white">
                  <div className="flex flex-col space-y-4">
                    {/* Input Prompt */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
                      <input
                        type="text"
                        placeholder="Введите запрос"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={`flex-1 border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          loading || dashboardLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading || dashboardLoading}
                      />
                      <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
                        disabled={loading || dashboardLoading}
                      >
                        {loading ? 'Загрузка...' : 'Узнать'}
                      </button>
                    </div>

                    {/* Source select with eye icon */}
                    <div className="flex items-center space-x-2 w-full">
                      <label htmlFor="source" className="font-semibold">
                        Источник:
                      </label>
                      <div className="flex-1 flex items-center">
                        <select
                          id="source"
                          value={tableName}
                          onChange={(e) => {
                            setTableName(e.target.value)
                            setGeneratedGraphs([]) // Clear generated graphs when table changes
                          }}
                          className={`flex-1 border p-1 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-8 text-sm ${
                            loading || dashboardLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={loading || dashboardLoading}
                        >
                          <option value="">Выберите источник</option>
                          {dashboardData.map((table) => (
                            <option key={table.table_name} value={table.table_name}>
                              {table.display_name}
                            </option>
                          ))}
                        </select>

                        {/* Eye icon */}
                        <button
                          type="button"
                          onClick={handleToggleTable}
                          className="ml-2 text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center"
                          disabled={!tableName || tableLoading}
                          aria-label="Показать таблицу"
                        >
                          {/* Eye SVG icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 3C5.6 3 1.7 6.1 0 10c1.7 3.9 5.6 7 10 7s8.3-3.1 10-7c-1.7-3.9-5.6-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                            <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Display errors */}
                    {error && (
                      <div className="p-4 bg-red-100 text-red-700 rounded-lg w-full">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Disclaimer */}
                </div>
                <div className="text-center text-sm text-gray-500 p-3">
                  Аишка может допускать ошибки. Рекомендуем проверять важную информацию.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Модальное окно с таблицей */}
      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Затемняющий фон */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <div className="flex justify-between items-center">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {tableData?.display_name || 'Данные таблицы'}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-4">
                    {tableLoading ? (
                      <div className="text-center">Загрузка...</div>
                    ) : tableError ? (
                      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {tableError}
                      </div>
                    ) : tableData ? (
                      <div>
                        {/* Описание столбцов */}
                        <div className="mb-4">
                          <h4 className="font-semibold">Описание столбцов:</h4>
                          <ul className="list-disc list-inside">
                            {Object.entries(tableData.descriptions).map(([column, description]) => (
                              <li key={column}>
                                <strong>{column}:</strong> {description}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Таблица данных */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border">
                            <thead>
                              <tr>
                                {tableData.columns.map((col: string) => (
                                  <th key={col} className="py-2 px-4 border-b text-left">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.data.slice(0, 10).map((row: any, index: number) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                  {tableData.columns.map((col: string) => (
                                    <td key={col} className="py-2 px-4 border-b">
                                      {row[col]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Графики */}
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-2">Графики:</h4>
                          <div className="space-y-4">
                            {tableData.graphs.length > 0 ? (
                              tableData.graphs.map((graph: Graph) => (
                                <div key={graph.graph_id} className="bg-gray-100 p-4 rounded-lg">
                                  <p className="text-sm text-gray-700 mb-2"><strong>Описание:</strong> {graph.prompt}</p>
                                  <iframe
                                    srcDoc={atob(graph.graph_html)}
                                    style={{
                                      width: '100%',
                                      height: '500px',
                                      border: 'none',
                                      overflow: 'hidden',
                                    }}
                                    title={`Graph-${graph.graph_id}`}
                                    sandbox="allow-scripts allow-same-origin"
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    Создано: {new Date(graph.timestamp * 1000).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-600">Графики для этой таблицы отсутствуют.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
