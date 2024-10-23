// app/dashboard/reports/page.tsx
'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  PlayCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'
import { useAuth } from '@/app/context/AuthContext'

function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

interface Tab {
  name: string
  href: string
  current: boolean
}

interface TableMetadata {
  table_name: string
  display_name: string
  table_type: 'excel' | 'google'
  last_updated: number // Unix format
}

interface ColumnSchema {
  column_name: string
  column_type: string
  column_desc: string
}

interface TableSchema {
  name: string
  columns: ColumnSchema[]
}

interface Graph {
  graph_id: number
  table_name: string
  graph_data: any // Replace with your actual graph data type
}

const initialTabs: Array<Tab> = [
  { name: 'Google таблицы', href: '#', current: true },
  { name: 'Excel', href: '#', current: false },
]

export default function ReportsPage() {
  const { token } = useAuth()

  // States
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditColumnsOpen, setIsEditColumnsOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [reportType, setReportType] = useState('Управленческий отчет')
  const [reportName, setReportName] = useState('')
  const [currentTabs, setCurrentTabs] = useState(initialTabs)
  const [googleSheetURL, setGoogleSheetURL] = useState('')
  const [numRows, setNumRows] = useState<number | null>(null)
  const [tables, setTables] = useState<TableMetadata[]>([])
  const [graphs, setGraphs] = useState<Graph[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null)
  const [currentEditingTable, setCurrentEditingTable] = useState<TableMetadata | null>(null)
  const [schema, setSchema] = useState<TableSchema | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const currentTab = currentTabs.find((tab) => tab.current)?.name

  // Sample file and video URLs
  const sampleFileUrl = '/files/sample_report.xlsx' // Update with the correct path
  const videoUrl = '/videos/instruction.mp4' // Update with the correct path

  // Fetch tables on mount
  useEffect(() => {
    if (token) {
      fetchTables()
      fetchGraphs()
    }
  }, [token])

  const getAuthHeaders = () => {
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  const fetchTables = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: getAuthHeaders(),
      })
      const data = response.data
      if (data.tables && Array.isArray(data.tables)) {
        setTables(data.tables)
      } else {
        setNotification({ type: 'error', message: 'Некорректный формат данных от сервера.' })
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: 'Ошибка при загрузке таблиц.' })
    } finally {
      setLoading(false)
    }
  }

  // Fetch graphs (placeholder)
  const fetchGraphs = async () => {
    // Implement fetch graphs logic
  }

  // Handle adding report
  const handleAddReport = async () => {
    try {
      if (currentTab === 'Google таблицы') {
        setIsProcessing(true)

        // Generate schema
        const schemaResponse = await axios.post(
          `${API_BASE_URL}/generate_schema`,
          {
            sheet_url: googleSheetURL,
            num_rows: numRows,
          },
          {
            headers: getAuthHeaders(),
          }
        )

        if (schemaResponse.status === 200 && schemaResponse.data) {
          setSchema(schemaResponse.data)
          setIsOpen(false)
          setIsEditColumnsOpen(true)
        } else {
          throw new Error('Не удалось сгенерировать схему таблицы.')
        }
      }
      // Add logic for Excel if needed
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Ошибка при добавлении отчета.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Create table after editing columns
  const handleCreateTable = async () => {
    if (!schema) return

    try {
      setIsProcessing(true)

      const payload = {
        json_data: schema,
        sheet_url: googleSheetURL,
        num_rows: numRows,
        display_name: reportName || 'Новый Google отчет',
      }

      const response = await axios.post(`${API_BASE_URL}/create_table`, payload, {
        headers: getAuthHeaders(),
      })

      if (response.status === 200 && response.data.status === 'success') {
        const newTable: TableMetadata = {
          table_name: response.data.table_name,
          display_name: reportName || 'Новый Google отчет',
          table_type: 'google',
          last_updated: Date.now() / 1000,
        }
        setTables([...tables, newTable])
        setNotification({ type: 'success', message: 'Таблица успешно создана.' })
        setIsEditColumnsOpen(false)
        setSchema(null)
        setGoogleSheetURL('')
        setReportName('')
        setNumRows(null)
      } else {
        throw new Error(response.data.message || 'Не удалось создать таблицу.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка при создании таблицы.' })
    } finally {
      setIsProcessing(false)
    }
  }

  // Update table
  const handleUpdateTable = async (table_name: string) => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${API_BASE_URL}/update_table`,
        { table_name },
        {
          headers: getAuthHeaders(),
        }
      )

      if (response.status === 200 && response.data.status === 'success') {
        setNotification({ type: 'success', message: 'Таблица успешно обновлена.' })
        await fetchTables()
      } else {
        throw new Error(response.data.message || 'Не удалось обновить таблицу.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Ошибка при обновлении таблицы.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete table
  const handleDeleteTable = async (table_name: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту таблицу?')) return

    try {
      setLoading(true)
      const response = await axios.post(
        `${API_BASE_URL}/delete_table`,
        { table_name },
        {
          headers: getAuthHeaders(),
        }
      )

      if (response.status === 200 && response.data.status === 'success') {
        const updatedTables = tables.filter((table) => table.table_name !== table_name)
        setTables(updatedTables)
        setNotification({ type: 'success', message: 'Таблица успешно удалена.' })
      } else {
        throw new Error(response.data.message || 'Не удалось удалить таблицу.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Ошибка при удалении таблицы.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle tab click
  const handleTabClick = (selectedTabName: string) => {
    const updatedTabs = currentTabs.map((tab) => ({
      ...tab,
      current: tab.name === selectedTabName,
    }))
    setCurrentTabs(updatedTabs)
  }

  // Filter tables
  const filteredTables = tables.filter((table) => {
    if (currentTab === 'Excel') return table.table_type === 'excel'
    if (currentTab === 'Google таблицы') return table.table_type === 'google'
    return true
  })

  // Auto-hide notifications
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
      {/* Preloader */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-75">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span className="text-white text-lg">Обработка...</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-80">
        {/* Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Загрузить отчеты
              </h2>
            </div>

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

            {/* Tabs */}
            <div className="mt-10">
              {/* Mobile tabs */}
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Выберите вкладку
                </label>
                <select
                  id="tabs"
                  name="tabs"
                  value={currentTab}
                  onChange={(e) => handleTabClick(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {currentTabs.map((tab) => (
                    <option key={tab.name} value={tab.name}>
                      {tab.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Desktop tabs */}
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                    {currentTabs.map((tab) => (
                      <button
                        key={tab.name}
                        onClick={() => handleTabClick(tab.name)}
                        className={classNames(
                          tab.current
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium'
                        )}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div>
              <div className="mt-6 flex gap-4">
                {currentTab === 'Google таблицы' && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <ArrowDownTrayIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                    Загрузить гугл таблицу
                  </button>
                )}

                {/* Additional buttons */}
                <a
                  href={sampleFileUrl}
                  download
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 
                    shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <DocumentIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  Пример файла
                </a>

                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 
                    shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <PlayCircleIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  Видео инструкция
                </button>
              </div>
            </div>

            {/* Video Instruction Modal */}
            <Transition.Root show={isVideoOpen} as={Fragment}>
              <Dialog as="div" className="relative z-10" onClose={setIsVideoOpen}>
                {/* Overlay */}
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

                {/* Modal content */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
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
                      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white 
                        px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                        <div>
                          <div className="flex justify-between items-center">
                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                              Видео инструкция
                            </Dialog.Title>
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-500"
                              onClick={() => setIsVideoOpen(false)}
                            >
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                          <div className="mt-4">
                            <video controls className="w-full h-auto">
                              <source src={videoUrl} type="video/mp4" />
                              Ваш браузер не поддерживает воспроизведение видео.
                            </video>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>

            {/* Reports table */}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Имя
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Тип отчета
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Статус
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Обновлено
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {loading && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                              Загрузка таблиц...
                            </td>
                          </tr>
                        )}
                        {!loading && filteredTables.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                              Нет доступных таблиц.
                            </td>
                          </tr>
                        )}
                        {!loading &&
                          filteredTables.map((table) => (
                            <tr key={table.table_name}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {table.display_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 capitalize">
                                {table.table_type === 'excel' ? 'Excel' : 'Google Таблицы'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                Подключен к дашбоарду
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                {new Date(table.last_updated * 1000).toLocaleString()}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6 flex gap-4">
                                <button
                                  onClick={() => handleUpdateTable(table.table_name)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Обновить
                                </button>

                                <button
                                  onClick={() => handleDeleteTable(table.table_name)}
                                  className="text-red-600 hover:underline"
                                >
                                  Удалить
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* Модальное окно для добавления отчета */}
            <Transition.Root show={isOpen} as={Fragment}>
              <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
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
                          Добавление Google таблицы
                        </Dialog.Title>
                        <div className="mt-5">
                          {/* Поле ввода ссылки на Google таблицу */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Ссылка на Google таблицу
                            </label>
                            <input
                              type="url"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              placeholder="Вставьте ссылку на Google таблицу"
                              value={googleSheetURL}
                              onChange={(e) => setGoogleSheetURL(e.target.value)}
                            />
                          </div>

                          {/* Поле ввода количества строк */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Количество строк для анализа (оставьте пустым для всех строк)
                            </label>
                            <input
                              type="number"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              placeholder="Например, 100"
                              value={numRows !== null ? numRows : ''}
                              onChange={(e) => setNumRows(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </div>

                          {/* Выпадающий список типа отчета */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Тип отчета
                            </label>
                            <select
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              value={reportType}
                              onChange={(e) => setReportType(e.target.value)}
                            >
                              <option>Управленческий отчет</option>
                              <option>Отчет по продажам / маркетингу</option>
                              <option>Отчет по персоналу</option>
                              <option>Отчет по проектам</option>
                              <option>Другой</option>
                            </select>
                          </div>

                          {/* Поле названия отчета */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Название отчета
                            </label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              placeholder="Например, о прибылях и убытках, о продажах и тд"
                              value={reportName}
                              onChange={(e) => setReportName(e.target.value)}
                            />
                          </div>

                          {/* Кнопка действия */}
                          <div className="mt-5 sm:mt-6">
                            <button
                              type="button"
                              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                              onClick={handleAddReport}
                            >
                              Добавить отчет
                            </button>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            {/* Конец модального окна для добавления отчета */}

            {/* Модальное окно для редактирования колонок */}
            <Transition.Root show={isEditColumnsOpen} as={Fragment}>
              <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={setIsEditColumnsOpen}>
                <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
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
                      {/* Содержимое модального окна */}
                      <div>
                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 text-center">
                          Редактирование колонок таблицы
                        </Dialog.Title>
                        <div className="mt-4">
                          {schema && (
                            <form>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                  <thead>
                                    <tr>
                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                        Название колонки
                                      </th>
                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                        Тип данных
                                      </th>
                                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                        Описание
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {schema.columns.map((column, index) => (
                                      <tr key={index}>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          {column.column_name}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          {column.column_type}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          <input
                                            type="text"
                                            value={column.column_desc}
                                            onChange={(e) => {
                                              const updatedColumns = [...schema.columns]
                                              updatedColumns[index].column_desc = e.target.value
                                              setSchema({
                                                ...schema,
                                                columns: updatedColumns,
                                              })
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                      {/* Кнопки действия */}
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          onClick={handleCreateTable}
                          className="inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Подтвердить
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsEditColumnsOpen(false)}
                        >
                          Отмена
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition.Root>
            {/* Конец модального окна для редактирования колонок */}
          </div>
        </main>
      </div>
    </div>
  )
}
