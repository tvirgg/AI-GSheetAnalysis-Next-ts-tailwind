'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { API_BASE_URL } from 'baseapi/config'; // Используем новый алиас

// Функция для объединения классов
function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

// Функция для преобразования индекса в буквенное обозначение колонки (A, B, ..., Z, AA, AB, ...)
function getColumnLabel(index: number): string {
  let label = ''
  let temp = index + 1
  while (temp > 0) {
    let modulo = (temp - 1) % 26
    label = String.fromCharCode(65 + modulo) + label
    temp = Math.floor((temp - modulo) / 26)
  }
  return label
}

// Определение интерфейса для вкладок
interface Tab {
  name: string
  href: string
  current: boolean
}

// Определение интерфейса для метаданных таблицы
interface TableMetadata {
  table_name: string
  display_name: string
  table_type: 'excel' | 'google'
  last_updated: string // ISO формат
}

// Данные для вкладок
const initialTabs: Array<Tab> = [
  { name: 'Excel', href: '#', current: true },
  { name: 'Google таблицы', href: '#', current: false },
  // { name: 'API (В разработке)', href: '#', current: false }, // В разработке
]

export default function ReportsPage() {
  // Состояния для управления компонентом
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditColumnsOpen, setIsEditColumnsOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [reportType, setReportType] = useState('Управленческий отчет')
  const [reportName, setReportName] = useState('')
  const [currentTabs, setCurrentTabs] = useState(initialTabs)
  const [googleSheetURL, setGoogleSheetURL] = useState('')

  // Состояния для данных таблиц
  const [tables, setTables] = useState<TableMetadata[]>([]) // Инициализируем пустым массивом
  const [loading, setLoading] = useState<boolean>(false)

  // Состояния для уведомлений
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null)

  // Состояние для текущей таблицы, которую редактируют (пока можно оставить null или использовать другой интерфейс)
  const [currentEditingTable, setCurrentEditingTable] = useState<TableMetadata | null>(null)

  // Определение текущего выбранного таба
  const currentTab = currentTabs.find((tab) => tab.current)?.name

  // Получение списка таблиц при монтировании компонента
  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`)
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

  // Обработчик выбора файла
  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx, .xls, .csv' // Ограничение типов файлов (по желанию)
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files && target.files[0]
      if (file) {
        setUploadedFileName(file.name)
        // Дополнительная обработка файла (например, загрузка на сервер)
      }
    }
    input.click()
  }

  // Обработчик добавления отчета
  const handleAddReport = async () => {
    try {
      if (currentTab === 'Excel') {
        // Логика загрузки файла Excel на сервер
        // Например, использование FormData
        const formData = new FormData()
        // Предположим, что у вас есть файл, который нужно загрузить
        // Но в текущем коде файл только выбран, не загружен
        // Поэтому необходимо реализовать логику загрузки

        // Пример:
        // formData.append('file', selectedFile)

        // const response = await axios.post(`${API_BASE_URL}/upload_excel`, formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // })

        // Если API для загрузки файла отсутствует, можно оставить заглушку

        // Для демонстрации создадим новую таблицу локально
        const newTable: TableMetadata = {
          table_name: `table_${Date.now()}`,
          display_name: reportName || 'Новый Excel отчет',
          table_type: 'excel',
          last_updated: new Date().toISOString(),
        }

        // Добавляем таблицу в список
        setTables([...tables, newTable])
        setNotification({ type: 'success', message: 'Таблица успешно добавлена.' })
        setIsOpen(false)
        setUploadedFileName('')
        setReportName('')
      } else if (currentTab === 'Google таблицы') {
        // Логика добавления Google таблицы через API
        const payload = {
          google_sheet_url: googleSheetURL,
          display_name: reportName || 'Новый Google отчет',
          report_type: reportType,
        }

        // Отправляем запрос на сервер для добавления Google таблицы
        const response = await axios.post(`${API_BASE_URL}/add_google_table`, payload)

        if (response.status === 200) {
          const newTable: TableMetadata = response.data.table
          setTables([...tables, newTable])
          setNotification({ type: 'success', message: 'Google таблица успешно добавлена.' })
          setIsOpen(false)
          setGoogleSheetURL('')
          setReportName('')
        } else {
          throw new Error('Не удалось добавить Google таблицу.')
        }
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка при добавлении отчета.' })
    }
  }

  // Обработчик переключения вкладок
  const handleTabClick = (selectedTabName: string) => {
    const updatedTabs = currentTabs.map((tab) => ({
      ...tab,
      current: tab.name === selectedTabName,
    }))
    setCurrentTabs(updatedTabs)
  }

  // Фильтрация таблиц по типу
  const filteredTables = tables.filter((table) => {
    if (currentTab === 'Excel') return table.table_type === 'excel'
    if (currentTab === 'Google таблицы') return table.table_type === 'google'
    return false
  })

  // Обработчик обновления таблицы (для всех типов)
  const handleUpdateTable = async (table_name: string) => {
    try {
      setLoading(true)
      // Логика обновления таблицы через API
      const response = await axios.get(`${API_BASE_URL}/tables/${table_name}`)

      if (response.status === 200) {
        setNotification({ type: 'success', message: 'Таблица успешно обновлена.' })
        // Возможно, нужно обновить конкретную таблицу в состоянии
        // Например, перезагрузить список таблиц
        await fetchTables()
      } else {
        throw new Error('Не удалось обновить таблицу.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка при обновлении таблицы.' })
    } finally {
      setLoading(false)
    }
  }

  // Обработчик удаления таблицы
  const handleDeleteTable = async (table_name: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту таблицу?')) return

    try {
      setLoading(true)
      // Логика удаления таблицы через API
      const response = await axios.delete(`${API_BASE_URL}/tables/${table_name}`)

      if (response.status === 200 && response.data.status === 'success') {
        // Удалить таблицу из состояния
        setTables(tables.filter((table) => table.table_name !== table_name))

        // Показать уведомление об успешном удалении
        setNotification({ type: 'success', message: 'Таблица успешно удалена.' })
      } else {
        throw new Error(response.data.message || 'Не удалось удалить таблицу.')
      }
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка при удалении таблицы.' })
    } finally {
      setLoading(false)
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
            {/* Заголовок страницы */}
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Загрузить отчеты
              </h2>
            </div>

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

            {/* Вкладки для переключения типов отчетов */}
            <div className="mt-10">
              {/* Вкладки для мобильных устройств */}
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
              {/* Вкладки для настольных устройств */}
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

            {/* Кнопки действий */}
            <div>
              <div className="mt-6 flex gap-4">
                {currentTab === 'Excel' && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <ArrowDownTrayIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                    Загрузить файл
                  </button>
                )}

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

                {/* Кнопки для примера файла и видео инструкции */}
                <button
                  type="button"
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <DocumentIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  Пример файла
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <PlayCircleIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  Видео инструкция
                </button>
              </div>
            </div>

            {/* Таблица отчетов */}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          {/* Столбец "Имя" */}
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
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {loading && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                              Загрузка таблиц...
                            </td>
                          </tr>
                        )}
                        {!loading && filteredTables.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                              Нет доступных таблиц.
                            </td>
                          </tr>
                        )}
                        {!loading &&
                          filteredTables.map((table) => (
                            <tr key={table.table_name}>
                              {/* Столбец "Имя" */}
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {table.display_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 capitalize">
                                {table.table_type === 'excel' ? 'Excel' : 'Google Таблицы'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                Подключен к дашбоарду
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6 flex gap-4">
                                {/* Кнопка "Обновить" */}
                                <button
                                  onClick={() => handleUpdateTable(table.table_name)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Обновить
                                </button>

                                {/* Кнопка "Удалить" */}
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
          </div>
        </main>

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
                      {currentTab === 'Excel' ? 'Добавление отчета' : 'Добавление Google таблицы'}
                    </Dialog.Title>
                    <div className="mt-5">
                      {/* Раздел загрузки файла или ввода ссылки */}
                      {currentTab === 'Excel' && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Загруженный файл
                          </label>
                          <div className="mt-1 flex">
                            <input
                              type="text"
                              className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              value={uploadedFileName}
                              placeholder="Файл не выбран"
                              disabled
                            />
                            <button
                              type="button"
                              className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              onClick={handleFileSelect}
                            >
                              Выбрать файл
                            </button>
                          </div>
                        </div>
                      )}

                      {currentTab === 'Google таблицы' && (
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
                      )}

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
        {/* Поскольку мы теперь получаем только метаданные таблиц, редактирование колонок требует дополнительной реализации */}
        {/* Например, нужно создать отдельный API-эндпоинт для получения и обновления колонок таблицы */}
        {/* Пока оставим модальное окно без функционала или реализуем локально */}

        {/* Если необходимо редактировать метаданные таблицы (например, display_name), можно реализовать это здесь */}
        {/* Пример: */}
        <Transition.Root show={isEditColumnsOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setIsEditColumnsOpen}>
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
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                    {/* Заголовок модального окна */}
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900 text-center"
                    >
                      Редактирование таблицы: {currentEditingTable?.display_name}
                    </Dialog.Title>
                    <div className="mt-5">
                      {/* Здесь можно реализовать редактирование метаданных таблицы */}
                      {/* Например, изменить display_name */}
                      {currentEditingTable && (
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Название отчета
                            </label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              value={currentEditingTable.display_name}
                              onChange={(e) => {
                                const updatedTable: TableMetadata = {
                                  ...currentEditingTable,
                                  display_name: e.target.value,
                                }
                                setCurrentEditingTable(updatedTable)
                              }}
                            />
                          </div>

                          {/* Дополнительные поля для редактирования можно добавить здесь */}

                          {/* Кнопки действия */}
                          <div className="mt-6 flex justify-end space-x-3">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setIsEditColumnsOpen(false)}
                            >
                              Отмена
                            </button>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={async () => {
                                // Логика обновления таблицы через API
                                try {
                                  const payload = {
                                    display_name: currentEditingTable.display_name,
                                  }

                                  const response = await axios.put(`${API_BASE_URL}/tables/${currentEditingTable.table_name}`, payload)

                                  if (response.status === 200) {
                                    setNotification({ type: 'success', message: 'Таблица успешно обновлена.' })
                                    setIsEditColumnsOpen(false)
                                    await fetchTables()
                                  } else {
                                    throw new Error('Не удалось обновить таблицу.')
                                  }
                                } catch (err: any) {
                                  console.error(err)
                                  setNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка при обновлении таблицы.' })
                                }
                              }}
                            >
                              Подтвердить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Конец модального окна для редактирования таблицы */}
      </div>
    </div>
  )
}
