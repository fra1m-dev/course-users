# users - сервис пользователей

Небольшой NestJS микросервис для работы с пользователями и их статистикой.
Основной транспорт - RabbitMQ (RMQ), HTTP используется только для health-check.

## Что внутри

- NestJS + TypeORM + Postgres
- RMQ микросервис с паттернами сообщений
- Pino-логирование с редактированием чувствительных данных
- Health endpoints для liveness/readiness

## Быстрый старт

```bash
npm install
```

Создайте `.env` (или используйте существующий). Пример ниже.

```bash
npm run start:dev
```

Сервис поднимает:
- RMQ consumer (очередь по `RMQ_USERS_QUEUE`)
- HTTP сервер на `PORT` (по умолчанию 3002)

## Переменные окружения

Обязательные:

- `RABBITMQ_URL` - строка подключения к RabbitMQ
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Часто используемые:

- `NODE_ENV` - `development` | `test` | `production`
- `PORT` - HTTP порт (по умолчанию `3002`)
- `RMQ_USERS_QUEUE` - имя очереди (по умолчанию `users`)
- `RMQ_PREFETCH` - prefetch count (по умолчанию `16`)

Опциональные для очереди:

- `RMQ_DLX` - dead-letter exchange
- `RMQ_MESSAGE_TTL_MS` - TTL сообщений
- `RMQ_MAX_LENGTH` - ограничение длины очереди

Логи:

- `LOG_LEVEL` - уровень (`info`, `debug` и т.д.)
- `LOG_PRETTY` - `true` для pretty-логов в dev
- `SERVICE_NAME`, `SERVICE_VERSION` - служебные поля в логах

Минимальный пример `.env`:

```env
NODE_ENV=development
PORT=3002

RABBITMQ_URL=amqp://guest:guest@localhost:5672
RMQ_USERS_QUEUE=users
RMQ_PREFETCH=16

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=users
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

## Архитектура

- `src/main.ts` - bootstrap, подключение RMQ, запуск HTTP, глобальный RMQ-логгер
- `src/app.module.ts` - конфиг, TypeORM, модули
- `src/modules/user` - доменная логика пользователей и статистики
- `src/modules/health` - health endpoints
- `src/common/logger` - настройка pino (редактура и форматирование логов)

TypeORM запускается с `synchronize` вне `production` (схема обновляется автоматически).

## Контракты RMQ

Паттерны лежат в `src/contracts/users.patterns.ts`.
Для трассировки логов поддерживается поле `meta.requestId`.

### users.create

Создать пользователя.

```json
{
  "meta": { "requestId": "..." },
  "createUserDto": {
    "email": "user@example.com",
    "name": "Иван",
    "role": "user",
    "specializationId": 1
  }
}
```

### users.getByEmail

Получить пользователя по email.

```json
{
  "meta": { "requestId": "..." },
  "authUserDto": { "email": "user@example.com" }
}
```

### users.getUserById

Получить пользователя по id.

```json
{
  "meta": { "requestId": "..." },
  "id": 123
}
```

### users.getAll

Получить список пользователей.

```json
{
  "meta": { "requestId": "..." }
}
```

### users.getStats

Получить статистику пользователя.

```json
{
  "meta": { "requestId": "..." },
  "id": 123
}
```

### users.applyQuizStats

Обновить агрегаты статистики (upsert).

```json
{
  "meta": { "requestId": "..." },
  "userId": 123,
  "patch": {
    "quizzesTotal": 10,
    "quizzesPassed": 8,
    "averageScore": 76.5,
    "lessonsTotal": 24,
    "lessonsCompleted": 18,
    "lastActiveAt": "2025-08-25T12:34:56.000Z"
  }
}
```

Примечание: обработчик `users.applyQuizStats` в контроллере пока не реализован.

## Модель данных

`users`:
- `id`, `name`, `email`, `role`, `specializationId`
- связанная запись `stats` (one-to-one)

`user_stats`:
- курсы, уроки, квизы
- `averageScore` хранится как numeric (в TypeORM приходит строкой)
- `lastActiveAt` - последняя активность

## HTTP endpoints

- `GET /health/live` - liveness
- `GET /health/ready` - readiness

## Скрипты

- `npm run start:dev` - dev
- `npm run build` - сборка
- `npm run start:prod` - запуск из `dist`
- `npm run test` - unit тесты

## Docker

Сборка prod-образа:

```bash
docker build -t users-service .
```

Запуск:

```bash
docker run --env-file .env -p 3002:3002 users-service
```

## Что стоит помнить

- Основной транспорт - RMQ, HTTP нужен для health-check.
- В `development` схема БД синхронизируется автоматически.
- В dev конфиг читает `.env` и `../.env`.
- Часть паттернов (например, update/delete) оставлена как черновики в коде.
