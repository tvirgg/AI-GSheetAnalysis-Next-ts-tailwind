// app/context/DashboardContext.tsx

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'

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

interface DashboardContextType {
  dashboardData: DashboardData[]
  setDashboardData: React.Dispatch<React.SetStateAction<DashboardData[]>>
  isLoading: boolean
  fetchDashboardData: () => Promise<void>
  addGraph: (tableName: string, newGraph: Graph) => void
  deleteGraph: (graphId: number, tableName: string) => Promise<void>
  refreshGraph: (graphId: number, tableName: string) => Promise<void>
  updateTableName: (tableName: string, newDisplayName: string) => Promise<void> // Добавлено
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
)

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    console.log('DashboardContext useEffect triggered. Token:', token)
    if (!token) return

    const loadData = async () => {
      console.log('Loading dashboard data...')
      const storedData = localStorage.getItem('dashboardData')
      if (storedData) {
        setDashboardData(JSON.parse(storedData))
      }
      await fetchDashboardData()
    }

    loadData()
  }, [token])

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Исправлено
  })

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/all_dashboards`, { // Добавлены обратные кавычки
        headers: getAuthHeaders(),
      })
      const data: DashboardData[] = response.data.tables || response.data
      setDashboardData(data)
      localStorage.setItem('dashboardData', JSON.stringify(data))
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const addGraph = (tableName: string, newGraph: Graph) => {
    setDashboardData((prevData) => {
      const updatedData = prevData.map((table) => {
        if (table.table_name === tableName) {
          return { ...table, graphs: [...table.graphs, newGraph] }
        }
        return table
      })
      localStorage.setItem('dashboardData', JSON.stringify(updatedData))
      return updatedData
    })
  }

  const deleteGraph = async (graphId: number, tableName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/delete_graph`, // Добавлены обратные кавычки
        { graph_id: graphId, table_name: tableName },
        { headers: getAuthHeaders() }
      )
      if (response.status === 200 && response.data.status === 'success') {
        setDashboardData((prevData) => {
          const updatedData = prevData.map((table) => {
            if (table.table_name === tableName) {
              return {
                ...table,
                graphs: table.graphs.filter(
                  (graph) => graph.id !== graphId
                ),
              }
            }
            return table
          })
          localStorage.setItem('dashboardData', JSON.stringify(updatedData))
          return updatedData
        })
      } else {
        throw new Error(response.data.message || 'Failed to delete graph.')
      }
    } catch (err: any) {
      console.error('Error deleting graph:', err)
      throw err
    }
  }

  const refreshGraph = async (graphId: number, tableName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/refresh_graph`, // Добавлены обратные кавычки
        { graph_id: graphId, table_name: tableName },
        { headers: getAuthHeaders() }
      )
      if (response.status === 200 && response.data.status === 'success') {
        await fetchDashboardData()
      } else {
        throw new Error('Failed to refresh graph.')
      }
    } catch (err: any) {
      console.error('Error refreshing graph:', err)
      throw err
    }
  }

  // Добавляем функцию updateTableName
  const updateTableName = async (tableName: string, newDisplayName: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/edit_table_name`, // Добавлены обратные кавычки
        {
          table_name: tableName,
          new_display_name: newDisplayName,
        },
        {
          headers: getAuthHeaders(),
        }
      )

      if (response.data.status === 'success') {
        // Обновляем локальное состояние
        setDashboardData((prevData) =>
          prevData.map((table) =>
            table.table_name === tableName
              ? { ...table, display_name: newDisplayName }
              : table
          )
        )
        // Обновляем localStorage
        const updatedData = dashboardData.map((table) =>
          table.table_name === tableName
            ? { ...table, display_name: newDisplayName }
            : table
        )
        localStorage.setItem('dashboardData', JSON.stringify(updatedData))
      } else {
        throw new Error(response.data.message || 'Failed to update table name.')
      }
    } catch (error: any) {
      console.error('Error updating table name:', error)
      throw error
    }
  }

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        setDashboardData,
        isLoading,
        fetchDashboardData,
        addGraph,
        deleteGraph,
        refreshGraph,
        updateTableName, // Добавлено
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext)
  if (context === undefined)
    throw new Error('useDashboard must be used within a DashboardProvider')
  return context
}
