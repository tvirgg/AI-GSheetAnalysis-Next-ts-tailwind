// components/LazyIframe.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Preloader from './Preloader';

interface LazyIframeProps {
  srcDoc: string;
  title: string;
  className?: string;
  forceLoad?: boolean; // Новый пропс
}

const LazyIframe: React.FC<LazyIframeProps> = ({ srcDoc, title, className, forceLoad = false }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(forceLoad);
  const [scriptContent, setScriptContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (forceLoad) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible, forceLoad]);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        const cache = await caches.open('script-cache');
        const scriptUrls = [
          'https://cdn.plot.ly/plotly-2.35.2.min.js',
          'https://cdn.jsdelivr.net/npm/apexcharts'
        ];

        const contents = await Promise.all(
          scriptUrls.map(async (url) => {
            let response = await cache.match(url);
            if (!response) {
              console.log(`Загрузка скрипта из сети: ${url}`);
              response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response.clone());
                console.log(`Скрипт загружен и кэширован: ${url}`);
                return await response.text();
              } else {
                console.error(`Не удалось загрузить скрипт: ${url}`);
                return '';
              }
            } else {
              console.log(`Скрипт найден в кэше: ${url}`);
              return await response.text();
            }
          })
        );

        setScriptContent(contents.join('\n'));
      } catch (error) {
        console.error('Ошибка при загрузке скриптов:', error);
      }
    };

    if (isVisible) {
      loadScripts();
    }
  }, [isVisible]);

  useEffect(() => {
    const writeIframeContent = () => {
      if (isVisible && scriptContent && iframeRef.current) {
        const iframeDocument = iframeRef.current.contentDocument;
        if (iframeDocument) {
          iframeDocument.open();
          iframeDocument.write(`
            <html>
              <head>
                <style>
                  #chart {
                    width: 100%;
                    height: 100%;
                  }
                  body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                  }
                </style>
                <script>
                  ${scriptContent}
                  console.log('Внешние скрипты загружены');
                </script>
              </head>
              <body>
                ${srcDoc}
                <script>
                  console.log('Инициализация графика начата');
                </script>
              </body>
            </html>
          `);
          iframeDocument.close();
          console.log('Содержимое iframe записано');
        }
      }
    };

    writeIframeContent();
  }, [isVisible, scriptContent, srcDoc]);

  const handleLoad = () => {
    setIsLoading(false);
    console.log('Iframe загружен');
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white flex justify-center items-center z-10 transition-opacity duration-300">
          <Preloader />
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={title}
        className={`w-full h-full border-0 rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
      />
    </div>
  );
};

export default LazyIframe; 