'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
  updateTableName: (tableName: string, newDisplayName: string) => Promise<void>
  deleteGraph: (graphId: number, tableName: string) => Promise<void>
  refreshGraph: (graphId: number, tableName: string) => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      const storedData = localStorage.getItem('dashboardData')
      if (storedData) {
        setDashboardData(JSON.parse(storedData))
      } else {
        await fetchDashboardData()
      }
    }

    loadData()
  }, [token])

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  })

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
      // Optionally, handle errors globally or pass them to components
    } finally {
      setIsLoading(false)
    }
  }

  const updateTableName = async (tableName: string, newDisplayName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/update_table_name`,
        { table_name: tableName, display_name: newDisplayName },
        { headers: getAuthHeaders() }
      )
      if (response.status === 200 && response.data.status === 'success') {
        await fetchDashboardData()
      } else {
        throw new Error(response.data.message || 'Failed to update table name.')
      }
    } catch (err: any) {
      console.error(err)
      throw err
    }
  }

  const deleteGraph = async (graphId: number, tableName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/delete_graph`,
        { graph_id: graphId, table_name: tableName },
        { headers: getAuthHeaders() }
      )
      if (response.status === 200 && response.data.status === 'success') {
        await fetchDashboardData()
      } else {
        throw new Error(response.data.message || 'Failed to delete graph.')
      }
    } catch (err: any) {
      console.error(err)
      throw err
    }
  }

  const refreshGraph = async (graphId: number, tableName: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/refresh_graph`,
        { graph_id: graphId, table_name: tableName },
        { headers: getAuthHeaders() }
      )
      if (response.status === 200 && response.data.status === 'success') {
        await fetchDashboardData()
      } else {
        throw new Error('Failed to refresh graph.')
      }
    } catch (err: any) {
      console.error(err)
      throw err
    }
  }

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        setDashboardData,
        isLoading,
        fetchDashboardData,
        updateTableName,
        deleteGraph,
        refreshGraph,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
