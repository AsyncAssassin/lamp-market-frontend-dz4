# LampMarket. Домашнее задание 4

Frontend пользовательской части интернет-магазина лампочек на React.

Проект реализует ДЗ4: интерфейс ДЗ3 подключен к backend-микросервисам товаров и заказов из ДЗ2, HTTP-запросы выполняются через `fetch`, глобальное состояние товаров, корзины и заказов хранится в Redux Toolkit.

## Что реализовано

- каталог товаров из `product-service`;
- загрузка категорий из `product-service`;
- поиск и фильтрация каталога через параметры запроса backend;
- карточка товара по `id`;
- корзина из `order-service`;
- добавление товара в корзину;
- изменение количества;
- удаление позиции;
- оформление заказа;
- подтверждение заказа;
- список заказов пользователя;
- детали заказа;
- состояния загрузки, ошибки, пустого результата и успешного действия;
- обработка `404`, `409`, `422`, `503` и сетевых ошибок;
- Vite proxy для работы без CORS-правок backend;
- `X-User-Id: 1` для учебного пользовательского сценария.

## Технологии

- React
- Vite
- React Router DOM
- Redux Toolkit
- React Redux
- `fetch`
- CSS

## Репозитории

Frontend:

```text
https://github.com/AsyncAssassin/lamp-market-frontend-dz4
```

Backend ДЗ2:

```text
https://github.com/AsyncAssassin/lamp-market-dz2
```

Ожидаемая структура папок при локальной проверке:

```text
Веб-разработка/
  lamp-market-dz2/
  lamp-market-frontend-dz4/
```

Пример клонирования:

```bash
git clone https://github.com/AsyncAssassin/lamp-market-dz2.git
git clone https://github.com/AsyncAssassin/lamp-market-frontend-dz4.git
```

## Требования

- Node.js `20.19+` или `22.12+`;
- npm;
- Docker и Docker Compose.

## Запуск backend

Backend запускается из репозитория `lamp-market-dz2`.

```bash
cd ../lamp-market-dz2
docker compose up -d --build
until curl -f http://localhost:8001/health && curl -f http://localhost:8002/health; do sleep 2; done
```

Сервисы:

| Сервис | Адрес |
|---|---|
| `product-service` | `http://localhost:8001` |
| `order-service` | `http://localhost:8002` |

Swagger:

| Сервис | Документация |
|---|---|
| товары | `http://localhost:8001/docs` |
| заказы | `http://localhost:8002/docs` |

## Запуск frontend

```bash
cd ../lamp-market-frontend-dz4
npm ci
npm run dev
```

Локальный адрес Vite:

```text
http://localhost:5173
```

Если порт занят, Vite покажет другой свободный адрес.

## Проверка

```bash
npm run lint
npm run build
npm run test:integration
```

Быстрая проверка backend:

```bash
curl -f http://localhost:8001/api/products
curl -f http://localhost:8002/api/cart -H 'X-User-Id: 1'
curl -f 'http://localhost:8002/api/orders?page=1&limit=20' -H 'X-User-Id: 1'
```

## Маршруты frontend

| Маршрут | Страница |
|---|---|
| `/` | каталог |
| `/catalog` | каталог |
| `/products/:id` | карточка товара |
| `/cart` | корзина |
| `/checkout` | оформление заказа |
| `/order-success` | подтверждение заказа |
| `/orders` | список заказов |
| `/orders/:id` | детали заказа |
| `*` | страница 404 |

## Интеграция с backend

Frontend обращается к backend через Vite proxy:

| Frontend URL | Backend |
|---|---|
| `/product-api/api/categories` | `http://localhost:8001/api/categories` |
| `/product-api/api/products` | `http://localhost:8001/api/products` |
| `/product-api/api/products/:id` | `http://localhost:8001/api/products/:id` |
| `/order-api/api/cart` | `http://localhost:8002/api/cart` |
| `/order-api/api/cart/items` | `http://localhost:8002/api/cart/items` |
| `/order-api/api/orders` | `http://localhost:8002/api/orders` |
| `/order-api/api/orders/:id` | `http://localhost:8002/api/orders/:id` |

Для запросов к `order-service` отправляется заголовок:

```http
X-User-Id: 1
```

Это учебный пользователь без авторизации. Авторизация и роли по условию ДЗ4 не реализуются.

## Сценарий демонстрации

В DevTools нужно открыть Network, включить фильтр `Fetch/XHR`, `Preserve log` и показать:

1. `GET /product-api/api/categories`.
2. `GET /product-api/api/products`.
3. Поиск по `search=LED`.
4. Фильтр по `category_id=1`.
5. `GET /product-api/api/products/1`.
6. `POST /order-api/api/cart/items`, Headers с `X-User-Id: 1`, Payload с `product_id` и `quantity`.
7. Последующий `GET /order-api/api/cart`.
8. `PUT /order-api/api/cart/items/:id`.
9. `DELETE /order-api/api/cart/items/:id`.
10. Снова добавить товар в корзину через `POST /order-api/api/cart/items`.
11. `POST /order-api/api/orders`, Payload с данными покупателя и Response с номером заказа.
12. `GET /order-api/api/orders`.
13. `GET /order-api/api/orders/:id`.

Для чистого демо можно поднять backend в отдельном compose project:

```bash
cd ../lamp-market-dz2
export COMPOSE_PROJECT_NAME=lampmarket_dz4_demo
docker compose down -v
docker compose up -d --build
until curl -f http://localhost:8001/health && curl -f http://localhost:8002/health; do sleep 2; done
```

## Не входит в ДЗ4

- панель управления;
- авторизация и регистрация;
- роли пользователей;
- JWT;
- оплата;
- интеграция доставки;
- административные маршруты backend.
