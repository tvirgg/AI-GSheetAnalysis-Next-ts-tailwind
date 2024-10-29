// components/ScriptLoader.tsx

'use client';
import { useEffect } from 'react';

const ScriptLoader: React.FC = () => {
  useEffect(() => {
    const loadScriptsContent = async () => {
      const cacheName = 'script-cache';
      const scriptUrls = [
        'https://cdn.plot.ly/plotly-2.35.2.min.js',
        'https://cdn.jsdelivr.net/npm/apexcharts'
      ];

      // Проверяем, есть ли кэш с нужными скриптами
      const cache = await caches.open(cacheName);
      const cachedResponses = await Promise.all(scriptUrls.map((url) => cache.match(url)));

      // Если скрипты уже есть в кэше, выходим
      if (cachedResponses.every((response) => response)) return;

      // Если кэша нет, загружаем скрипты и сохраняем их в кэш
      await Promise.all(
        scriptUrls.map(async (url) => {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        })
      );
    };

    loadScriptsContent();
  }, []);

  return null;
};

export default ScriptLoader;