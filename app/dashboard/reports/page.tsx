'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

// Функция для объединения классов
function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}

// Определение интерфейса для вкладок
interface Tab {
  name: string
  href: string
  current: boolean
}

// Данные для вкладок
const tabs: Array<Tab> = [
  { name: 'Excel', href: '#', current: true },
  { name: 'Google таблицы', href: '#', current: false },
  { name: 'API (В разработке)', href: '#', current: false },
]

// Данные для таблицы
const people = [
  { name: 'Отчет о прибыли и убытках', title: 'Подключен к дашборду' },
  { name: 'Проекты в работе', title: 'Подключен к дашборду' },
]

export default function ReportsPage() {
  // Состояния для управления компонентом
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [reportType, setReportType] = useState('Управленческий отчет')
  const [reportName, setReportName] = useState('')

  // Обработчик выбора файла
  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept=".xlsx, .xls, .csv" // Ограничение типов файлов (по желанию)
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
  const handleAddReport = () => {
    // Логика отправки данных формы на сервер
    // Например, с использованием fetch или axios

    // Пример:
    /*
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('reportType', reportType)
    formData.append('reportName', reportName)

    fetch('/api/reports', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        // Обработка успешного ответа
        setIsOpen(false)
        // Дополнительные действия, например, обновление списка отчетов
      })
      .catch(error => {
        // Обработка ошибок
        console.error('Error:', error)
      })
    */

    // Пока просто закрываем модальное окно
    setIsOpen(false)
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
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Загрузить отчеты
              </h2>
              {/* Дополнительный текст (закомментирован) */}
              {/* <div className="mt-2 text-gray-700">
                Мы поможем вам разобраться в Панельке и начать работу с ней всего за 3 шага
              </div> */}
            </div>

            {/* Вкладки для переключения типов отчетов */}
            <div className="mt-10">
              {/* Вкладки для мобильных устройств */}
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                <select
                  id="tabs"
                  name="tabs"
                  defaultValue={tabs.find((tab) => tab.current)?.name}
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {tabs.map((tab) => (
                    <option key={tab.name}>{tab.name}</option>
                  ))}
                </select>
              </div>
              {/* Вкладки для настольных устройств */}
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <a
                        key={tab.name}
                        href={tab.href}
                        aria-current={tab.current ? 'page' : undefined}
                        className={classNames(
                          tab.current
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                        )}
                      >
                        {tab.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div>
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <ArrowDownTrayIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  Загрузить файл
                </button>

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
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
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
                        {people.map((person, idx) => (
                          <tr key={idx}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {person.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">
                              {person.title}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6 flex gap-4">
                              <a href="#" className="text-red-600 hover:underline">
                                Удалить
                              </a>

                              <a href="#" className="text-red-700 hover:underline">
                                Отключить от дашборда
                              </a>
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
                      Добавление отчета
                    </Dialog.Title>
                    <div className="mt-5">
                      {/* Раздел загрузки файла */}
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
        {/* Конец модального окна */}
      </div>
    </div>
  )
}
