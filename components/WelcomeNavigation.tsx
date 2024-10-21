// components/WelcomeNavigation.tsx
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  CursorArrowRaysIcon,
  PlayCircleIcon,
  PlusCircleIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/context/AuthContext'

const navigation = [
  {
    id: 1,
    title: 'Подключите отчеты, которые вы ведете (например, управленческие отчеты, о продажах и тд)',
    subtitle: 'Чтобы отобразить все ключевые показатели на одной странице',
    icon: PlusCircleIcon,
    href: 'dashboard/reports',
  },
  {
    id: 2,
    title: 'Выберите показатели, которые вы хотите отобразить',
    subtitle: 'Так мы поймем, что показывать вам на дашборде',
    icon: CursorArrowRaysIcon,
    href: 'dashboard/ai',
  },
  {
    id: 3,
    title: 'Откройте дашборд и наблюдайте за показателями',
    subtitle: 'Чтобы видеть актуальную ситуацию по каждой области бизнеса',
    icon: PresentationChartBarIcon,
    href: 'dashboard/my',
  },
]

export default function WelcomeNavigation() {
  const { user } = useAuth()
  const userName = user?.username || 'Пользователь'

  return (
    <div className="m-7">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Добро пожаловать, {userName}!
        </h2>
        <div className="mt-2 text-gray-700">
          Мы поможем вам разобраться в Панельке и начать работу с ней всего за 3 шага
        </div>
      </div>

      <ul
        role="list"
        className="mt-8 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
      >
        {navigation.map((item) => (
          <li
            key={item.id}
            className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
          >
            <div className="flex min-w-0 gap-x-4">
              <item.icon aria-hidden="true" className="h-12 w-12 text-gray-500" />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  <a href={item.href}>
                    <span className="absolute inset-x-0 -top-px bottom-0" />
                    {item.title}
                  </a>
                </p>
                <p className="mt-1 flex text-xs leading-5 text-gray-500">{item.subtitle}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-x-4">
              <ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
            </div>
          </li>
        ))}
        <li className="relative flex justify-between px-4 py-4 hover:bg-gray-50 sm:px-6 divide-gray-900/5 bg-gray-50">
          <a
            href=""
            className="flex items-center justify-center gap-x-2.5 py-3 text-sm font-semibold leading-6 text-blue-500"
          >
            <PlayCircleIcon aria-hidden="true" className="h-5 w-5 flex-none text-blue-500" />
            Посмотреть видео-инструкцию по началу работы &rarr;
          </a>
        </li>
      </ul>
    </div>
  )
}