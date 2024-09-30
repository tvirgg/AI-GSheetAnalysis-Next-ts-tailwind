'use client'

import { useState } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ')
}


export default function ReportsPage () {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="lg:pl-72">
          <Navbar setSidebarOpen={setSidebarOpen} />
          
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className='px-3 flex flex-col'>
              <div className='px-3 flex flex-row   items-center'>
                <svg  width="62" height="58" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="82" height="82" fill="url(#pattern0_592_1299)"/>
                  <defs>
                  <pattern id="pattern0_592_1299" patternContentUnits="objectBoundingBox" width="1" height="1">
                  <use href="#image0_592_1299" transform="scale(0.005)"/>
                  </pattern>
                  <image id="image0_592_1299" width="200" height="200" href="data:image/png;base64,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"/>
                  </defs>
                </svg>
                <h1 className='ml-1 font-semibold text-[25px]'>
                  Аишка
                </h1>
              </div>
                <p className='my-4 mx-6'>
                  Задавайте вопросы, чтобы  получить информацию
                  о состоянии бизнеса и наиболее важных показателях
                </p>
              </div>
              <div className="my-10 mx-auto w-1/2 grid grid-cols-2 gap-6">
                <div className="p-10 border rounded-lg shadow">Какие показатели ухудшились в этом месяце?</div>
                <div className="p-10 border rounded-lg shadow">Есть ли риск кассового разрыва?</div>
                <div className="p-10 border rounded-lg shadow">Какие мои товары имеют наибольшую маржу?</div>
                <div className="p-10 border rounded-lg shadow">Кто из продавцов не выполнил план в последнем месяце?</div>
              </div>
              <div className="mt-24 mx-20  flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Введите запрос"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <button className="bg-gray-300 px-4 py-2 rounded text-sm font-semibold">
                  Узнать
                </button>
              </div>
              <div className="my-5 mx-20 flex items-center space-x-2">
                <label htmlFor="source" className="text-sm font-semibold whitespace-nowrap">
                  Источник:
                </label>
                <div className="flex-1">
                  <select
                    id="source"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-gray-300">
                    <option value="report-1">отчет яндекс-метрика.csv</option>
                    <option value="report-2">отчет о продажах.xls</option>
                  </select>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
