// RootLayout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { DashboardProvider } from './context/DashboardContext';
import Script from 'next/script';
import ScriptLoader from '../components/ScriptLoader'; // Импортируем ScriptLoader

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Панелька',
  description: 'Created by Gerus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      {/* <head>
        <link rel="preconnect" href="https://cdn.plot.ly" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      </head> */}
      <body className={inter.className}>
        {/* Скрипты */}
        {/* <Script 
          src="https://cdn.plot.ly/plotly-2.35.2.min.js" 
          strategy="beforeInteractive" 
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/apexcharts" 
          strategy="beforeInteractive" 
        />
         */}
        {/* Клиентский компонент для загрузки скриптов в Cache API */}
        <ScriptLoader />
        
        {/* Оборачиваем всё приложение в AuthProvider и DashboardProvider */}
        <AuthProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
