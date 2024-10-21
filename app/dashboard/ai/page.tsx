'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline' // Импорт иконки закрытия
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

// Define interfaces
interface ChartResponse {
  status: string
  graph_html: string
  timestamp: number
  prompt: string
  message?: string
}

interface TableItem {
  display_name: string
  last_updated: number
  table_name: string
  table_type: string
}

interface DashboardResponse {
  table_name: string
  display_name: string
  data: Array<{ [key: string]: any }>
  columns: string[]
  descriptions: { [key: string]: string }
  graphs: Array<{
    id: number
    timestamp: number
    prompt: string
    graph_html: string
    is_up_to_date: boolean
  }>
}

export default function AiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [tableName, setTableName] = useState<string>('') // State for selected table
  const [loading, setLoading] = useState(false)
  const [graphs, setGraphs] = useState<ChartResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  // States for tables
  const [tables, setTables] = useState<TableItem[]>([])
  const [tablesLoading, setTablesLoading] = useState<boolean>(false)
  const [tablesError, setTablesError] = useState<string | null>(null)

  // States for table modal
  const [tableData, setTableData] = useState<DashboardResponse | null>(null)
  const [tableLoading, setTableLoading] = useState<boolean>(false)
  const [tableError, setTableError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Ref for scrolling to the last graph
  const lastGraphRef = useRef<HTMLDivElement>(null)

  const { token: contextToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams() // Get query parameters

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

  // Fetch tables on component mount
  useEffect(() => {
    const fetchTables = async () => {
      setTablesLoading(true)
      setTablesError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/tables`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `Ошибка при получении таблиц: ${response.status} ${response.statusText}. ${errorText}`
          )
        }

        const data: { tables: TableItem[] } = await response.json()
        setTables(data.tables)

        // If table_name parameter is provided, set it
        if (tableNameParam) {
          const foundTable = data.tables.find((table) => table.table_name === tableNameParam)

          if (!foundTable) {
            setError('Указанный источник данных не найден.')
          } else {
            setTableName(foundTable.table_name)
          }
        }
      } catch (err: any) {
        setTablesError(err.message || 'Произошла ошибка при получении таблиц.')
      } finally {
        setTablesLoading(false)
      }
    }

    if (token) {
      fetchTables()
    }
  }, [token, tableNameParam])

  // Scroll to the last graph when a new graph is added
  useEffect(() => {
    if (lastGraphRef.current) {
      lastGraphRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [graphs])

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
        setGraphs((prevGraphs) => [...prevGraphs, data])
        setPrompt('')
        setError(null)
      } else {
        // Display error message from API
        setError(data.message || 'Не удалось создать график.')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка.')
    } finally {
      setLoading(false)
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
      setIsModalOpen(true) // Открыть модальное окно
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
                {/* Display graphs */}
                {graphs.length > 0 ? (
                  <div className="flex flex-col space-y-6">
                    {graphs.map((graph, index) => (
                      <div
                        key={index}
                        ref={index === graphs.length - 1 ? lastGraphRef : null}
                      >
                        <div className="bg-white p-4 rounded-lg shadow relative">
                          {/* Control buttons */}
                          <div className="absolute top-2 right-2 flex space-x-2">
                            {/* Refresh graph */}
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`${API_BASE_URL}/refresh_graph`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      graph_id: index,
                                      table_name: tableName,
                                    }),
                                  })

                                  const data: ChartResponse = await response.json()

                                  if (data.status === 'success') {
                                    // Update the graph
                                    setGraphs((prevGraphs) => {
                                      const updatedGraphs = [...prevGraphs]
                                      updatedGraphs[index] = data
                                      return updatedGraphs
                                    })
                                  } else {
                                    setError(data.message || 'Не удалось обновить график.')
                                  }
                                } catch (err: any) {
                                  setError(err.message || 'Произошла ошибка при обновлении графика.')
                                }
                              }}
                              className="text-blue-500 hover:text-blue-700"
                              aria-label="Обновить график"
                            >
                              {/* Refresh icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20.418 19H20v-5h-.582M12 12v8m0-8l4-4m-4 4l-4-4" />
                              </svg>
                            </button>
                            {/* Delete graph */}
                            <button
                              onClick={async () => {
                                const confirmDelete = window.confirm('Вы действительно хотите удалить этот график?')
                                if (!confirmDelete) return

                                try {
                                  const response = await fetch(`${API_BASE_URL}/delete_graph`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      graph_id: index,
                                      table_name: tableName,
                                    }),
                                  })

                                  const data = await response.json()

                                  if (data.status === 'success') {
                                    // Remove the graph
                                    setGraphs((prevGraphs) => prevGraphs.filter((_, i) => i !== index))
                                  } else {
                                    setError(data.message || 'Не удалось удалить график.')
                                  }
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
                            title={`Graph-${index}`}
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
                        className={`flex-1 border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          loading || tablesLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading || tablesLoading}
                      />
                      <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
                        disabled={loading || tablesLoading}
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
                          }}
                          className={`flex-1 border p-1 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-8 text-sm ${
                            loading || tablesLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={loading || tablesLoading}
                        >
                          <option value="">Выберите источник</option>
                          {tables.map((table) => (
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
                              {tableData.data.map((row: any, index: number) => (
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
                              tableData.graphs.map((graph: any) => (
                                <div key={graph.id} className="bg-gray-100 p-4 rounded-lg">
                                  <p className="text-sm text-gray-700 mb-2"><strong>Описание:</strong> {graph.prompt}</p>
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
