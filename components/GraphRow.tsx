// components/GraphRow.tsx
'use client';

import {
  TrashIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import LazyIframe from './LazyIframe'; // Импортируем наш новый компонент
import "../app/globals.css"; // Импорт стилей

interface Graph {
  id: number;
  timestamp: number;
  prompt: string;
  graph_html: string; // base64
  is_up_to_date: boolean;
}

interface GraphRowProps {
  graphs: Graph[];
  tableName: string;
  handleDeleteGraph: (id: number, tableName: string) => void;
  handleRefreshGraph: (id: number, tableName: string) => void;
  handleAddMetric: (tableName: string) => void;
}

const GraphRow: React.FC<GraphRowProps> = ({
  graphs,
  tableName,
  handleDeleteGraph,
  handleRefreshGraph,
  handleAddMetric,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string>('');

  const handleDownload = (graph: Graph) => {
    try {
      const decodedHtml = atob(graph.graph_html);
      const blob = new Blob([decodedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${graph.prompt}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании графика:', error);
      alert('Не удалось скачать график. Попробуйте позже.');
    }
  };

  const handleExpand = (graph: Graph) => {
    try {
      const decodedHtml = atob(graph.graph_html);
      setModalContent(decodedHtml); // Устанавливаем декодированный HTML
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка при развертывании графика:', error);
      alert('Не удалось отобразить график. Попробуйте позже.');
    }
  };

  return (
    <div className="relative mt-6 w-full">
      {/* Горизонтальная прокрутка с применением стилей скроллбара */}
      <div className="flex overflow-x-auto space-x-4 w-full scrollable-container">
        {graphs.slice().reverse().map((graph) => (
          <div
            key={graph.id}
            className="flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          >
            <div className="relative bg-white p-4 rounded-lg shadow h-[60vh] w-full overflow-hidden">
              {/* Контейнер для кнопок управления графиком */}
              <div className="absolute top-2 left-2 flex space-x-2 z-10">
                {/* Кнопка обновления графика */}
                <button
                  onClick={() => handleRefreshGraph(graph.id, tableName)}
                  className="text-indigo-500 hover:text-indigo-700"
                  aria-label="Обновить график"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>

                {/* Кнопка скачивания графика */}
                <button
                  onClick={() => handleDownload(graph)}
                  className="text-green-500 hover:text-green-700"
                  aria-label="Скачать график"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>

                {/* Кнопка развернуть график на весь экран */}
                <button
                  onClick={() => handleExpand(graph)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Развернуть график"
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                </button>

                {/* Кнопка удаления графика */}
                <button
                  onClick={() => handleDeleteGraph(graph.id, tableName)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Удалить график"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Отображение графика через LazyIframe */}
              <LazyIframe
                srcDoc={atob(graph.graph_html)}
                title={graph.prompt}
                className="w-full h-full border-0 rounded-lg"
              />
            </div>
          </div>
        ))}

        {/* Кнопка добавления нового графика */}
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

      {/* Модальное окно для развертывания графика */}
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
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
  );
};

export default GraphRow;
