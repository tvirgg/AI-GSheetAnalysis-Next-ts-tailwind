// app/dashboard/ai/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

// Определение интерфейсов
interface ChartResponse {
  status: string
  graph_html: string
  timestamp: number
  prompt: string
}

interface TableItem {
  display_name: string
  last_updated: number
  table_name: string
  table_type: string
}

export default function AiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [tableName, setTableName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [graphs, setGraphs] = useState<ChartResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  // Состояния для таблиц
  const [tables, setTables] = useState<TableItem[]>([])
  const [tablesLoading, setTablesLoading] = useState<boolean>(false)
  const [tablesError, setTablesError] = useState<string | null>(null)

  // Ссылка для прокрутки к последнему графику
  const lastGraphRef = useRef<HTMLDivElement>(null)
  const { token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams() // Получаем параметры запроса

  useEffect(() => {
    if (!token) {
      router.replace('/signin') // Перенаправляем на страницу входа
    }
  }, [token, router])

  // Получаем значение table_name из параметров запроса
  const tableNameParam = searchParams.get('table_name')

  // Получение таблиц при загрузке компонента
  useEffect(() => {
    const fetchTables = async () => {
      setTablesLoading(true)
      setTablesError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/tables`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Используем токен из контекста
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

        // Если есть параметр table_name, устанавливаем его после загрузки таблиц
        if (tableNameParam) {
const foundTable = tables.find((table) => table.table_name === tableNameParam);

if (!foundTable) {
  console.log(`Указанный источник данных не найден: ${tableNameParam}`);
  setError('Указанный источник данных не найден.');
  return;
}
 else {
            console.log(`Указанный источник данных не найден: ${tableNameParam}`)
            setError('Указанный источник данных не найден.')
            return
          }
        }

      } catch (err: any) {
        setTablesError(
          err.message || 'Произошла ошибка при получении таблиц.'
        )
      } finally {
        setTablesLoading(false)
      }
    }

    if (token) {
      fetchTables()
    }
  }, [token, tableNameParam])

  // Прокрутка к последнему графику при добавлении нового графика
  useEffect(() => {
    if (lastGraphRef.current) {
      lastGraphRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [graphs])

  // Функция для обработки отправки запроса
  const handleSubmit = async () => {
    // Проверка, что запрос не пустой
    if (!prompt.trim()) {
      setError('Пожалуйста, введите запрос.')
      return
    }

    // Проверка, что выбран источник
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
          'Authorization': `Bearer ${token}`, // Используем токен из контекста
        },
        body: JSON.stringify({
          table_name: tableName,
          chart_prompt: prompt,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Ошибка: ${response.status} ${response.statusText}. ${errorText}`
        )
      }

      const data: ChartResponse = await response.json()

      if (data.status === 'success') {
        setGraphs((prevGraphs) => [...prevGraphs, data]) // Добавляем новый график в массив
        setPrompt('') // Очищаем поле ввода
      } else {
        throw new Error('Не удалось создать график.')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка.')
    } finally {
      setLoading(false)
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
            {/* Область ответов (графики) */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 mb-24 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                {graphs.length === 0 ? (
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
                          setPrompt(
                            'Какие показатели ухудшились в этом месяце?'
                          )
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
                          setPrompt(
                            'Какие мои товары имеют наибольшую маржу?'
                          )
                        }
                      >
                        Какие мои товары имеют наибольшую маржу?
                      </div>
                      <div
                        className="p-10 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          setPrompt(
                            'Кто из продавцов не выполнил план в последнем месяце?'
                          )
                        }
                      >
                        Кто из продавцов не выполнил план в последнем месяце?
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-6">
                    {graphs.map((graph, index) => (
                      <div
                        key={index}
                        ref={index === graphs.length - 1 ? lastGraphRef : null}
                      >
                        <div className="bg-gray-50 p-4 rounded-lg shadow">
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
                            Создано:{' '}
                            {new Date(
                              graph.timestamp * 1000
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Фиксированный блок ввода запроса и дисклэймер */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-80 z-50">
              {/* Внешний контейнер фиксированного блока ввода с серым фоном */}
              <div className="bg-gray-50">
                {/* Внутренний контейнер с отступами и ограниченной шириной */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 shadow-custom bg-white">
                  <div className="flex flex-col space-y-4">
                    {/* Input Prompt */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
                      <input
                        type="text"
                        placeholder="Введите запрос"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
                        disabled={loading || tablesLoading}
                      >
                        {loading ? 'Загрузка...' : 'Узнать'}
                      </button>
                    </div>

                    {/* Селект источника */}
                    <div className="flex items-center space-x-2 w-full">
                      <label htmlFor="source" className="font-semibold">
                        Источник:
                      </label>
                      <div className="flex-1">
                        {tablesLoading ? (
                          <p>Загрузка источников...</p>
                        ) : tablesError ? (
                          <p className="text-red-500">{tablesError}</p>
                        ) : tables.length === 0 ? (
                          <p>Таблицы не найдены.</p>
                        ) : (
                          <select
                            id="source"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="w-full border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Выберите источник</option>
                            {tables.map((table) => (
                              <option
                                key={table.table_name}
                                value={table.table_name}
                              >
                                {table.display_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Отображение ошибок */}
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

      {/* Стили для кастомного скроллбара и боковой тени */}
      <style jsx>{`
        /* Стилизация кастомного скроллбара для области ответов */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 4px;
        }

        /* Для Firefox */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        /* Кастомная тень для блока ввода */
        .shadow-custom {
          border-radius: 10px;
        }

        .loader {
          border-top-color: #3498db;
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
