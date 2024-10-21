// app/dashboard/my/page.tsx
'use client'

import { useState, useEffect, useContext } from 'react'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { TableContext } from '@/app/context/TableContext'
import GraphRow from '@/components/GraphRow'

interface Graph {
  id: number
  timestamp: number
  prompt: string
  graph_html: string // base64
  is_up_to_date: boolean
}

interface DashboardData {
  display_name: string
  table_name: string
  data: Array<Record<string, any>>
  columns: Array<string>
  descriptions: Record<string, string>
  graphs: Array<Graph>
}

export default function MyDashboard() {
  const { token } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null)
  const [editingTableNameId, setEditingTableNameId] = useState<string | null>(null)
  const [newTableName, setNewTableName] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem('dashboardData')
    if (storedData) {
      setDashboardData(JSON.parse(storedData))
    } else {
      setIsLoading(true)
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token])

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/all_dashboards`, {
        headers: getAuthHeaders(),
      })
      const data: DashboardData[] = response.data.tables || response.data
      setDashboardData(data)
      localStorage.setItem('dashboardData', JSON.stringify(data))
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: 'Ошибка при загрузке данных дэшборда.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMetric = (tableName: string) => {
    router.push(`/dashboard/ai?table_name=${encodeURIComponent(tableName)}`)
  }

  const handleDeleteGraph = async (graphId: number, tableName: string) => {
    const confirmed = confirm('Вы действительно хотите удалить этот график?')
    if (!confirmed) return

    try {
      const response = await axios.post(
        `${API_BASE_URL}/delete_graph`,
        {
          graph_id: graphId,
          table_name: tableName,
        },
        {
          headers: getAuthHeaders(),
        }
      )

      if (response.status === 200 && response.data.status === 'success') {
        setNotification({ type: 'success', message: response.data.message })
        await fetchDashboardData()
      } else {
        throw new Error(response.data.message || 'Не удалось удалить график.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Что-то пошло не так.',
      })
    }
  }

  const handleRefreshGraph = async (graphId: number, tableName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/refresh_graph`,
        {
          graph_id: graphId,
          table_name: tableName,
        },
        {
          headers: getAuthHeaders(),
        }
      )

      if (response.status === 200 && response.data.status === 'success') {
        setNotification({ type: 'success', message: response.data.message })
        await fetchDashboardData()
      } else {
        throw new Error('Не удалось обновить график.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Что-то пошло не так.',
      })
    }
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSaveTableName = async (tableName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/update_table_name`,
        { table_name: tableName, display_name: newTableName },
        { headers: getAuthHeaders() }
      )
      if (response.status === 200 && response.data.status === 'success') {
        setNotification({ type: 'success', message: 'Название таблицы обновлено.' })
        await fetchDashboardData()
        setEditingTableNameId(null)
      } else {
        throw new Error(response.data.message || 'Не удалось обновить название таблицы.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Ошибка при обновлении названия таблицы.',
      })
    }
  }

  return (
    <div className="flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 lg:pl-80">
        {/* Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Notifications */}
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

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Загрузка данных...</p>
              </div>
            )}

            {/* Dashboard data */}
            {!isLoading && dashboardData && dashboardData.length > 0 ? (
              dashboardData.map((section) => (
                <section key={section.table_name} className="mt-12">
                  <div className="mt-2 md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      {editingTableNameId === section.table_name ? (
                        <input
                          type="text"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                          {section.display_name}
                        </h2>
                      )}
                    </div>
                    <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
                      {editingTableNameId === section.table_name ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveTableName(section.table_name)}
                            className="inline-flex items-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTableNameId(null)}
                            className="ml-2 inline-flex items-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAddMetric(section.table_name)}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <PlusIcon aria-hidden="true" className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTableNameId(section.table_name)
                              setNewTableName(section.display_name)
                            }}
                            className="ml-2 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <PencilIcon aria-hidden="true" className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* GraphRow component */}
                  {section.graphs && section.graphs.length > 0 ? (
                    <GraphRow
                      graphs={section.graphs}
                      tableName={section.table_name}
                      handleDeleteGraph={handleDeleteGraph}
                      handleRefreshGraph={handleRefreshGraph}
                      handleAddMetric={handleAddMetric}
                    />
                  ) : (
                    <div className="mt-4 text-center p-4 text-gray-500">
                      Показатели отсутствуют. Нажмите на кнопку{' '}
                      <PlusIcon aria-hidden="true" className="inline h-5 w-5" /> справа, чтобы добавить.
                    </div>
                  )}
                </section>
              ))
            ) : (
              !isLoading && (
                <div className="text-center p-4 text-gray-500">
                  Нет доступных данных.
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
