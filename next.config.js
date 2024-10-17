const https = require('https');

module.exports = {
  // Остальные настройки Next.js
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, module: false };

    return config;
  },
  devServer: {
    https: {
      cert: './ssl/cert.oem',
      key: './ssl/privkey.pem',
      // Отключаем проверку сертификата
      rejectUnauthorized: false
    },
    before: (app) => {
      // Игнорируем проблемы с сертификатами при разработке
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    },
  },
};
