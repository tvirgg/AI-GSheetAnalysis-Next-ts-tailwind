# Translate the README content to Russian
readme_content_ru = """
# AI Dashboard Reports

Это проект AI Dashboard Reports, который позволяет анализировать и визуализировать данные с помощью различных отчетов.

## Требования

- На вашем компьютере должны быть установлены Node.js и npm.
- Необходимо настроить базу данных PostgreSQL для хранения данных.

## Установка

1. **Клонируйте репозиторий**

    ```bash
    git clone <repository-url>
    cd ai-dashboard-reports-main
    ```

2. **Установите зависимости**

    ```bash
    npm install
    ```

3. **Настройка окружения**

    Создайте файл `.env` в корневой директории проекта и добавьте свои данные для подключения к базе данных. Пример `.env` файла:

    ```
    POSTGRES_PRISMA_URL=postgresql://<user>:<password>@localhost:5432/<database>
    POSTGRES_URL_NON_POOLING=postgresql://<user>:<password>@localhost:5432/<database>
    ```

4. **Запустите миграции базы данных**

    Примените миграции Prisma для настройки схемы базы данных:

    ```bash
    npx prisma migrate deploy
    ```

5. **Сгенерируйте Prisma Client**

    Сгенерируйте Prisma клиент для взаимодействия с базой данных:

    ```bash
    npx prisma generate
    ```

## Запуск приложения

Для запуска приложения в режиме разработки используйте команду:

```bash
npm run dev
