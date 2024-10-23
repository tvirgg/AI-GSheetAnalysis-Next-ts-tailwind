// components/GraphRow.tsx
'use client'

import {
  TrashIcon,
  CircleStackIcon,
  ArrowDownTrayIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

interface Graph {
  id: number
  timestamp: number
  prompt: string
  graph_html: string // base64
  is_up_to_date: boolean
}

interface GraphRowProps {
  graphs: Graph[]
  tableName: string
  handleDeleteGraph: (id: number, tableName: string) => void
  handleRefreshGraph: (id: number, tableName: string) => void
  handleAddMetric: (tableName: string) => void
}

const GraphRow: React.FC<GraphRowProps> = ({
  graphs,
  tableName,
  handleDeleteGraph,
  handleRefreshGraph,
  handleAddMetric,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string>('')

  const handleDownload = (graph: Graph) => {
    try {
      const decodedHtml = atob(graph.graph_html)
      const blob = new Blob([decodedHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${graph.prompt}.html`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка при скачивании графика:', error)
      alert('Не удалось скачать график. Попробуйте позже.')
    }
  }

  const handleExpand = (graph: Graph) => {
    try {
      const decodedHtml = atob(graph.graph_html)
      setModalContent(decodedHtml)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Ошибка при развертывании графика:', error)
      alert('Не удалось отобразить график. Попробуйте позже.')
    }
  }

  return (
    <div className="relative mt-6 w-full">
      {/* Horizontal scroll with custom scrollbar */}
      <div className="flex overflow-x-auto space-x-4 w-full scrollable-container">
        {graphs.map((graph) => (
          <div
            key={graph.id}
            className="flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          >
            <div className="relative bg-white p-4 rounded-lg shadow h-[60vh] w-full overflow-hidden">
              {/* Delete button */}
              <button
                onClick={() => handleDeleteGraph(graph.id, tableName)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                aria-label="Удалить график"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              {/* Refresh button */}
              <button
                onClick={() => handleRefreshGraph(graph.id, tableName)}
                className="absolute top-2 left-2 text-indigo-500 hover:text-indigo-700"
                aria-label="Обновить график"
              >
                <CircleStackIcon className="h-5 w-5" />
              </button>

              {/* Download button */}
              <button
                onClick={() => handleDownload(graph)}
                className="absolute top-2 left-12 text-green-500 hover:text-green-700"
                aria-label="Скачать график"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>

              {/* Expand button */}
              <button
                onClick={() => handleExpand(graph)}
                className="absolute top-2 left-24 text-blue-500 hover:text-blue-700"
                aria-label="Развернуть график"
              >
                <WrenchScrewdriverIcon className="h-5 w-5" />
              </button>

              {/* Display graph via iframe */}
              <iframe
                srcDoc={atob(graph.graph_html)}
                className="w-full h-full border-0 rounded-lg"
                title={graph.prompt}
                sandbox="allow-scripts allow-same-origin"
              />

              {/* Remove <p> elements with graph info */}
            </div>
          </div>
        ))}

        {/* Add new graph button */}
        <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-[60vh] w-full overflow-hidden">
            <button
              type="button"
              onClick={() => handleAddMetric(tableName)}
              className="flex flex-col items-center text-gray-500 hover:text-gray-700"
            >
              <PlusIcon aria-hidden="true" className="h-10 w-10" />
              <span className="mt-2">Добавить график</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for expanding graph */}
      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsModalOpen}>
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-200 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
                  <div className="absolute top-0 right-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <span className="sr-only">Закрыть</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <iframe
                      srcDoc={modalContent}
                      className="w-full h-[80vh] border-0 rounded-lg"
                      title="Развернутый график"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
