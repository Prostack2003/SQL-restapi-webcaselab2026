# Express REST API CaseLab

REST API на Node.js и Express для учёта оборудования производственной площадки и заявок на его техническое обслуживание.

Сервис позволяет:

- вести справочник оборудования;
- создавать и редактировать заявки на обслуживание;
- контролировать допустимые переходы статусов заявок;
- фильтровать, сортировать и постранично получать данные;
- запрещать удаление оборудования с открытыми заявками;
- получать прогноз погоды по координатам оборудования;
- оценивать пригодность погодного окна для наружных работ;
- получать ошибки в едином формате с идентификатором запроса.

Проект выполнен в рамках второй недели CaseLab. Данные хранятся в памяти процесса и сбрасываются после перезапуска приложения.

## Технологии

- Node.js 20+;
- Express 5;
- Zod;
- Pino;
- Helmet;
- CORS;
- express-rate-limit;
- Open-Meteo API;
- встроенный Node.js Test Runner;
- Postman.

## Требования к окружению

- Node.js версии 20 или новее;
- npm;
- доступ к интернету для получения прогноза Open-Meteo;
- Postman для запуска готовой API-коллекции.

Проверить версии:

```bash
node --version
npm --version
```

## Установка

Клонировать репозиторий:

```bash
git clone git@github.com:Prostack2003/Express-restapi-webcaselab2026.git
```

Перейти в каталог проекта:

```bash
cd Express-restapi-webcaselab2026
```

Установить зависимости из lock-файла:

```bash
npm ci
```

Создать локальный файл конфигурации:

```bash
cp .env.example .env
```

Файл <code>.env</code> не должен попадать в репозиторий.

## Переменные окружения

| Переменная                         | Назначение                                      | Значение в .env.example                           |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| <code>PORT</code>                  | Порт HTTP-сервера                               | <code>3000</code>                                 |
| <code>NODE_ENV</code>              | Режим работы приложения                         | <code>development</code>                          |
| <code>GEOCODING_BASE_URL</code>    | Базовый URL Open-Meteo Geocoding API            | <code>https://geocoding-api.open-meteo.com</code> |
| <code>FORECAST_BASE_URL</code>     | Базовый URL Open-Meteo Forecast API             | <code>https://api.open-meteo.com</code>           |
| <code>REQUEST_TIMEOUT_MS</code>    | Тайм-аут обращения к внешнему API, мс           | <code>5000</code>                                 |
| <code>TEMPERATURE_UNIT</code>      | Единица температуры в прогнозе                  | <code>celsius</code>                              |
| <code>PRECIPITATION_UNIT</code>    | Единица осадков в прогнозе                      | <code>mm</code>                                   |
| <code>MAX_WIND_SPEED_KMH</code>    | Максимальная допустимая скорость ветра, км/ч    | <code>20</code>                                   |
| <code>MAX_PRECIPITATION_MM</code>  | Максимально допустимое количество осадков, мм   | <code>0</code>                                    |
| <code>WEATHER_FORECAST_DAYS</code> | Количество дней прогноза                        | <code>3</code>                                    |
| <code>LOG_LEVEL</code>             | Минимальный уровень логирования Pino            | <code>info</code>                                 |
| <code>JSON_BODY_LIMIT</code>       | Максимальный размер JSON-тела запроса           | <code>100kb</code>                                |
| <code>CORS_ORIGINS</code>          | Разрешённые источники CORS через запятую        | <code>http://localhost:5173</code>                |
| <code>RATE_LIMIT_WINDOW_MS</code>  | Размер окна ограничения запросов, мс            | <code>60000</code>                                |
| <code>RATE_LIMIT_MAX</code>        | Максимальное число запросов с одного IP за окно | <code>100</code>                                  |

Для нескольких разрешённых источников значения перечисляются через запятую:

```dotenv
CORS_ORIGINS=http://localhost:5173,https://example.com
```

## Запуск

Обычный запуск:

```bash
npm start
```

Запуск в режиме разработки с автоматическим перезапуском:

```bash
npm run dev
```

По умолчанию API доступен по адресу:

```text
http://localhost:3000/api
```

Проверка доступности:

```bash
curl -i http://localhost:3000/api/health
```

Ожидаемое тело ответа:

```json
{
    "data": {
        "status": "ok"
    }
}
```

Каждый ответ также содержит заголовок <code>X-Request-Id</code>.

## Модель оборудования

| Поле                      | Тип и ограничения                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| <code>id</code>           | UUID, генерируется сервером                                                                            |
| <code>name</code>         | Строка от 3 до 100 символов                                                                            |
| <code>type</code>         | <code>turbine</code>, <code>inverter</code>, <code>sensor</code> или <code>substation</code>           |
| <code>serialNumber</code> | Непустая строка, уникальная без учёта регистра                                                         |
| <code>location.lat</code> | Число от -90 до 90                                                                                     |
| <code>location.lon</code> | Число от -180 до 180                                                                                   |
| <code>status</code>       | <code>operational</code>, <code>maintenance</code>, <code>fault</code> или <code>decommissioned</code> |
| <code>installedAt</code>  | ISO-дата, которая не может находиться в будущем                                                        |

## Модель заявки

| Поле                     | Тип и ограничения                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------- |
| <code>id</code>          | UUID, генерируется сервером                                                             |
| <code>equipmentId</code> | UUID существующего оборудования                                                         |
| <code>title</code>       | Строка от 5 до 120 символов                                                             |
| <code>description</code> | Необязательная строка от 1 до 2000 символов                                             |
| <code>priority</code>    | <code>low</code>, <code>medium</code>, <code>high</code> или <code>critical</code>      |
| <code>status</code>      | <code>new</code>, <code>in_progress</code>, <code>done</code> или <code>rejected</code> |
| <code>plannedAt</code>   | Необязательные ISO-дата и время                                                         |
| <code>createdAt</code>   | ISO-дата и время, устанавливаются сервером                                              |
| <code>updatedAt</code>   | ISO-дата и время, устанавливаются сервером                                              |

При создании заявка всегда получает статус <code>new</code>. Поля <code>id</code>, <code>status</code>, <code>createdAt</code> и <code>updatedAt</code> нельзя установить или изменить через обычные POST/PATCH-запросы. Неизвестные поля тела отбрасываются валидатором.

## Переходы статусов заявки

```text
new ───────────> in_progress ───────────> done
 │                    │
 └──────────────> rejected <────────────┘
```

Допустимы только следующие переходы:

- <code>new → in_progress</code>;
- <code>new → rejected</code>;
- <code>in_progress → done</code>;
- <code>in_progress → rejected</code>.

Статусы <code>done</code> и <code>rejected</code> являются конечными. Недопустимый переход возвращает <code>409 Conflict</code>.

## Эндпоинты

### Служебный маршрут

| Метод            | Маршрут                  | Назначение                   | Успешный ответ   |
| ---------------- | ------------------------ | ---------------------------- | ---------------- |
| <code>GET</code> | <code>/api/health</code> | Проверка доступности сервиса | <code>200</code> |

### Оборудование

| Метод               | Маршрут                                  | Назначение                           | Успешный ответ                                     |
| ------------------- | ---------------------------------------- | ------------------------------------ | -------------------------------------------------- |
| <code>GET</code>    | <code>/api/equipment</code>              | Список оборудования                  | <code>200</code>                                   |
| <code>POST</code>   | <code>/api/equipment</code>              | Создание оборудования                | <code>201</code> и заголовок <code>Location</code> |
| <code>GET</code>    | <code>/api/equipment/:id</code>          | Получение оборудования по UUID       | <code>200</code>                                   |
| <code>PATCH</code>  | <code>/api/equipment/:id</code>          | Частичное обновление оборудования    | <code>200</code>                                   |
| <code>DELETE</code> | <code>/api/equipment/:id</code>          | Удаление оборудования                | <code>204</code>                                   |
| <code>GET</code>    | <code>/api/equipment/:id/requests</code> | Заявки конкретного оборудования      | <code>200</code>                                   |
| <code>GET</code>    | <code>/api/equipment/:id/weather</code>  | Прогноз и пригодность погодного окна | <code>200</code>                                   |

Параметры <code>GET /api/equipment</code>:

| Параметр                   | Возможные значения                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <code>page</code>          | Целое число от 1, по умолчанию <code>1</code>                                                                  |
| <code>limit</code>         | Целое число от 1 до 100, по умолчанию <code>10</code>                                                          |
| <code>type</code>          | Один из типов оборудования                                                                                     |
| <code>status</code>        | Один из статусов оборудования                                                                                  |
| <code>sortBy</code>        | <code>name</code>, <code>type</code>, <code>serialNumber</code>, <code>status</code>, <code>installedAt</code> |
| <code>order</code>         | <code>asc</code> или <code>desc</code>                                                                         |
| <code>installedFrom</code> | Начало диапазона установки в формате ISO-даты                                                                  |
| <code>installedTo</code>   | Конец диапазона установки в формате ISO-даты                                                                   |

### Заявки на обслуживание

| Метод               | Маршрут                               | Назначение                  | Успешный ответ                                     |
| ------------------- | ------------------------------------- | --------------------------- | -------------------------------------------------- |
| <code>GET</code>    | <code>/api/requests</code>            | Список заявок               | <code>200</code>                                   |
| <code>POST</code>   | <code>/api/requests</code>            | Создание заявки             | <code>201</code> и заголовок <code>Location</code> |
| <code>GET</code>    | <code>/api/requests/:id</code>        | Получение заявки по UUID    | <code>200</code>                                   |
| <code>PATCH</code>  | <code>/api/requests/:id</code>        | Редактирование полей заявки | <code>200</code>                                   |
| <code>PATCH</code>  | <code>/api/requests/:id/status</code> | Смена статуса заявки        | <code>200</code>                                   |
| <code>DELETE</code> | <code>/api/requests/:id</code>        | Удаление заявки             | <code>204</code>                                   |

Параметры списков заявок:

| Параметр                 | Возможные значения                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| <code>page</code>        | Целое число от 1, по умолчанию <code>1</code>                                                                      |
| <code>limit</code>       | Целое число от 1 до 100, по умолчанию <code>10</code>                                                              |
| <code>equipmentId</code> | UUID оборудования                                                                                                  |
| <code>status</code>      | <code>new</code>, <code>in_progress</code>, <code>done</code>, <code>rejected</code>                               |
| <code>priority</code>    | <code>low</code>, <code>medium</code>, <code>high</code>, <code>critical</code>                                    |
| <code>sortBy</code>      | <code>createdAt</code>, <code>updatedAt</code>, <code>plannedAt</code>, <code>priority</code>, <code>status</code> |
| <code>order</code>       | <code>asc</code> или <code>desc</code>                                                                             |
| <code>createdFrom</code> | Начало диапазона в формате ISO date-time                                                                           |
| <code>createdTo</code>   | Конец диапазона в формате ISO date-time                                                                            |

Списки возвращают массив <code>data</code> и метаданные пагинации:

```json
{
    "data": [],
    "meta": {
        "total": 0,
        "page": 1,
        "limit": 10
    }
}
```

## Основные бизнес-правила

- Серийный номер оборудования уникален без учёта регистра. Дубликат возвращает <code>409</code>.
- Создание заявки для несуществующего оборудования возвращает <code>404</code>.
- Оборудование нельзя удалить, пока у него есть заявки в статусе <code>new</code> или <code>in_progress</code>; API возвращает <code>409</code>.
- Заявки в статусах <code>done</code> и <code>rejected</code> не блокируют удаление оборудования.
- Статус заявки изменяется только через <code>PATCH /api/requests/:id/status</code>.
- Пустое тело PATCH-запроса отклоняется с кодом <code>422</code>.
- Начальная граница диапазона дат не может быть позже конечной.

## Примеры работы с API

### Создание оборудования

```bash
curl -i -X POST http://localhost:3000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовая турбина",
    "type": "turbine",
    "serialNumber": "TURBINE-001",
    "location": {
      "lat": 55.75,
      "lon": 37.62
    },
    "status": "operational",
    "installedAt": "2025-01-01"
  }'
```

Пример ответа <code>201 Created</code>:

```json
{
    "data": {
        "id": "b681e4a5-cc4a-47c4-9efa-3c3285460c18",
        "name": "Тестовая турбина",
        "type": "turbine",
        "serialNumber": "TURBINE-001",
        "location": {
            "lat": 55.75,
            "lon": 37.62
        },
        "status": "operational",
        "installedAt": "2025-01-01"
    }
}
```

Ответ содержит заголовок:

```text
Location: /api/equipment/b681e4a5-cc4a-47c4-9efa-3c3285460c18
```

### Создание заявки

```bash
curl -i -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "b681e4a5-cc4a-47c4-9efa-3c3285460c18",
    "title": "Плановый осмотр турбины",
    "description": "Проверить крепления и датчики",
    "priority": "high",
    "plannedAt": "2030-09-25T10:00:00Z"
  }'
```

Сервер самостоятельно добавит <code>id</code>, статус <code>new</code>, <code>createdAt</code> и <code>updatedAt</code>.

### Фильтрация и пагинация заявок

```bash
curl "http://localhost:3000/api/requests?equipmentId=b681e4a5-cc4a-47c4-9efa-3c3285460c18&status=new&priority=high&sortBy=createdAt&order=desc&page=1&limit=10"
```

### Смена статуса

```bash
curl -i -X PATCH \
  http://localhost:3000/api/requests/44bed8a8-ceb2-4fb1-b8c4-f01e1118b8ee/status \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

### Получение прогноза

```bash
curl http://localhost:3000/api/equipment/b681e4a5-cc4a-47c4-9efa-3c3285460c18/weather
```

Фрагмент ответа:

```json
{
    "data": {
        "equipmentId": "b681e4a5-cc4a-47c4-9efa-3c3285460c18",
        "location": {
            "lat": 55.75,
            "lon": 37.62
        },
        "forecast": {
            "isSuitable": true,
            "criteria": {
                "maxWindSpeedKmh": 20,
                "maxPrecipitationMm": 0
            },
            "daily": [
                {
                    "date": "2026-09-20",
                    "temperatureMax": 18.6,
                    "temperatureMin": 9.8,
                    "precipitationMm": 0,
                    "maxWindSpeedKmh": 11,
                    "isSuitable": true
                }
            ]
        }
    }
}
```

День считается подходящим, когда одновременно выполняются условия:

```text
precipitationMm <= MAX_PRECIPITATION_MM
maxWindSpeedKmh <= MAX_WIND_SPEED_KMH
```

Общий <code>forecast.isSuitable</code> равен <code>true</code>, только если подходят все дни прогноза. Ошибка, тайм-аут или неизвестный формат ответа внешнего API преобразуются в <code>502 Bad Gateway</code> и не приводят к падению приложения.

## Формат ошибок

Все ошибки API имеют единую структуру:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Переданы некорректные данные",
        "details": [
            {
                "field": "name",
                "message": "Too small: expected string to have >=3 characters"
            }
        ],
        "requestId": "fe598c0c-2359-4772-945d-cc454b30d6e6"
    }
}
```

Поле <code>requestId</code> совпадает со значением заголовка <code>X-Request-Id</code> и позволяет найти запрос в логах.

| HTTP-код         | Код ошибки                          | Когда возвращается                  |
| ---------------- | ----------------------------------- | ----------------------------------- |
| <code>400</code> | <code>BAD_REQUEST</code>            | Некорректный JSON                   |
| <code>404</code> | <code>NOT_FOUND</code>              | Ресурс или маршрут не найден        |
| <code>409</code> | <code>CONFLICT</code>               | Конфликт бизнес-правил              |
| <code>413</code> | <code>PAYLOAD_TOO_LARGE</code>      | Превышен лимит тела запроса         |
| <code>422</code> | <code>VALIDATION_ERROR</code>       | Некорректные body, params или query |
| <code>429</code> | <code>RATE_LIMIT_EXCEEDED</code>    | Превышен лимит частоты запросов     |
| <code>500</code> | <code>INTERNAL_ERROR</code>         | Непредвиденная внутренняя ошибка    |
| <code>502</code> | <code>EXTERNAL_SERVICE_ERROR</code> | Ошибка внешнего погодного API       |

Пример запроса с некорректным JSON:

```bash
curl -i -X POST http://localhost:3000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{"name":'
```

Ответ <code>400 Bad Request</code>:

```json
{
    "error": {
        "code": "BAD_REQUEST",
        "message": "Некорректный JSON",
        "details": [],
        "requestId": "fe598c0c-2359-4772-945d-cc454b30d6e6"
    }
}
```

## Безопасность

### CORS

Разрешённые источники задаются явным списком в <code>CORS_ORIGINS</code>; значение <code>*</code> не используется. По умолчанию разрешён локальный frontend <code>http://localhost:5173</code>. Разрешены методы <code>GET</code>, <code>POST</code>, <code>PATCH</code>, <code>DELETE</code> и <code>OPTIONS</code>. Заголовок <code>X-Request-Id</code> доступен клиентскому JavaScript через <code>Access-Control-Expose-Headers</code>.

### Rate limiting

Ограничение применяется ко всем маршрутам <code>/api</code>. При превышении <code>RATE_LIMIT_MAX</code> запросов за <code>RATE_LIMIT_WINDOW_MS</code> API возвращает <code>429</code>, заголовок <code>Retry-After</code> и стандартные заголовки RateLimit.

Для локальной проверки можно временно установить:

```dotenv
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=2
```

После изменения <code>.env</code> приложение необходимо перезапустить.

### Остальные меры

- Helmet устанавливает защитные HTTP-заголовки.
- Размер JSON-тела ограничен переменной <code>JSON_BODY_LIMIT</code>.
- В ответах с непредвиденной ошибкой не раскрываются стек-трейсы и внутренние сообщения.
- Секреты и локальный <code>.env</code> исключены из Git.
- Cookie и пользовательская аутентификация в проекте не используются.

## Логирование и Request ID

В начале обработки каждому запросу присваивается UUID:

- он возвращается в заголовке <code>X-Request-Id</code>;
- включается в тело ответа об ошибке;
- записывается в структурированный JSON-лог.

Pino записывает метод, путь, HTTP-код, длительность и идентификатор запроса. Ответы с кодами 2xx/3xx логируются на уровне <code>info</code>, 4xx - <code>warn</code>, 5xx - <code>error</code>.

Пример:

```json
{
    "level": 30,
    "requestId": "d8d34aae-843c-4606-80fe-2fcb66cce93c",
    "method": "GET",
    "path": "/api/health",
    "statusCode": 200,
    "durationMs": 3,
    "msg": "HTTP request completed."
}
```

## Архитектура

Приложение использует слоистую архитектуру:

```text
HTTP-запрос
    ↓
routes
    ↓
validation middleware
    ↓
controllers
    ↓
services
    ↓
repositories
    ↓
хранилище в памяти
```

- **Routes** определяют URL и последовательность обработчиков.
- **Middleware** добавляют Request ID, логирование, защиту, разбор JSON и валидацию.
- **Controllers** преобразуют HTTP-запросы и ответы, не содержат бизнес-логику.
- **Services** реализуют бизнес-правила и работу со статусами.
- **Repositories** изолируют доступ к данным и возвращают копии объектов.
- **Validators** описывают схемы body, params и query.
- **Errors** содержат независимые от Express типы ошибок приложения.
- **API client** отвечает за обращение к Open-Meteo и тайм-аут.

Файл <code>src/app.js</code> собирает и экспортирует Express-приложение, а <code>src/server.js</code> только запускает HTTP-сервер. Это позволяет подключать <code>app</code> в интеграционных тестах без автоматического открытия порта.

Порядок глобальных middleware:

```text
Request ID
→ HTTP logger
→ Helmet
→ CORS
→ rate limiter для /api
→ JSON parser с ограничением размера
→ API routes
→ 404 handler
→ centralized error handler
```

## Структура проекта

```text
.
├── docs/postman/          # экспортированная Postman-коллекция
├── postman/               # актуальная коллекция с последовательным сценарием
├── src/
│   ├── api/               # клиент внешнего Open-Meteo API
│   ├── controllers/       # HTTP-контроллеры
│   ├── errors/            # типы ошибок приложения
│   ├── middlewares/       # валидация, безопасность, ошибки, логи
│   ├── repositories/      # хранилище оборудования и заявок в памяти
│   ├── routes/            # маршруты API
│   ├── services/          # бизнес-логика
│   ├── tests/             # автоматические тесты
│   ├── validators/        # Zod-схемы
│   ├── app.js             # сборка Express-приложения
│   ├── config.js          # конфигурация из переменных окружения
│   ├── logger.js          # настройка Pino
│   └── server.js          # запуск HTTP-сервера
├── .env.example
├── package.json
└── README.md
```

## Проверка проекта

### Автоматические проверки

Запустить тесты:

```bash
npm test
```

Тесты проверяют формирование URL для Open-Meteo Geocoding API и Forecast API.

Проверить код ESLint:

```bash
npm run lint
```

Проверить форматирование:

```bash
npm run format:check
```

Автоматически применить форматирование:

```bash
npm run format
```

### Postman

Актуальная коллекция:

```text
postman/express-rest-api-caselab.postman_collection.json
```

Она содержит 22 запроса, сгруппированных по разделам:

- Health;
- Equipment;
- Requests;
- Invalid Requests.

Коллекция использует переменные <code>baseUrl</code>, <code>equipmentId</code>, <code>maintenanceRequestId</code> и <code>equipmentSerial</code>. Pre-request-скрипт создаёт уникальный серийный номер, а post-response-скрипты сохраняют UUID созданных ресурсов и проверяют ответы через <code>pm.test</code>.

Для запуска:

1. Запустите приложение командой <code>npm run dev</code>.
2. В Postman выберите **Import** и импортируйте JSON-файл коллекции.
3. Убедитесь, что <code>baseUrl</code> равен <code>http://localhost:3000/api</code>.
4. Откройте Collection Runner.
5. Запустите коллекцию с одной итерацией, не изменяя порядок запросов.

Ожидаемые коды ошибок в негативных сценариях являются частью проверок и не означают сбой запуска.

## Ограничения текущей версии

- Данные находятся в памяти и удаляются при перезапуске сервера.
- Авторизация и аутентификация не реализованы.
- Docker-конфигурация отсутствует.
- Автоматические API-тесты на Supertest не добавлены; полный сценарий API проверяется через Postman.
