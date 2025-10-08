# Структура страниц и симулятора

Документ описывает принципы организации каталога `src/pages` и соответствующие модули `local-sim`, чтобы разработчики могли быстро найти нужный экран и данные.

## 1. Карта `src/pages`

- Доменные разделы (`home`, `lobby`, `game`, `catalog`, `auth`, `profile`, `admin`) лежат в корне и экспортируют свои страницы через `index.js`. 【F:dodepus-casino/src/pages/README.md†L1-L33】
- Каждый раздел хранит страницу в подпапке `page/`, а layout-компоненты — в `layout/`. 【F:dodepus-casino/src/pages/README.md†L5-L15】
- Профиль разбит на самостоятельные вкладки со своими подкаталогами и локальной логикой (`blocks/`, `hooks/`, `components/`). 【F:dodepus-casino/src/pages/README.md†L35-L38】
- Админка сгруппирована в `admin/features`, где каждая подпапка соответствует конкретному разделу панели управления. 【F:dodepus-casino/src/pages/admin/features/README.md†L1-L18】

## 2. Соответствие `admin/features` ↔ `local-sim/admin/features`

| UI раздел | Файл страницы | Модуль симулятора | Ответственность |
| --- | --- | --- | --- |
| Клиенты | `clients/Clients.jsx` | `local-sim/admin/features/clients/index.js` | Выборка и подписка на список клиентов. |
| Транзакции | `transactions/Transactions.jsx` | `local-sim/admin/features/transactions/index.js` | История операций и детализация платежей. |
| Верификация | `verification/Verification.jsx` | `local-sim/admin/features/verification/index.js` | Очередь KYC, решения, сбросы, история. |
| Промокоды — список | `promo/list/PromoCodes.jsx` | `local-sim/admin/features/promo/index.js` | CRUD операций над промокодами, события. |
| Промокоды — создание | `promo/create/PromoCodeCreate.jsx` | `local-sim/admin/features/promo/index.js` и `definitions/index.js` | Создание промокода, справочник типов. |
| Промокоды — архив | `promo/archive/PromoArchive.jsx` | `local-sim/admin/features/promo/index.js` | Управление архивом и статусами. |
| Роли | `access/roles/Roles.jsx` | `local-sim/admin/features/access/rolePermissionLogs.js` | Отображение ролей и журнал изменений. |
| Редактор роли | `access/role-edit/RoleEdit.jsx` | `local-sim/admin/features/access/rolePermissionLogs.js` | Правка прав и логирование. |
| Чаты | `communications/*/*.jsx` | `local-sim/admin/features/communications` | События и сообщения для разных каналов. |
| Мониторинг | `monitoring/log-admin/LogAdmin.jsx` | `local-sim/admin/features/monitoring` | Журнал действий персонала. |

## 3. Структура `local-sim`

- Пользовательские сценарии (`auth/`) предоставляют API и сиды для клиентских страниц. 【F:dodepus-casino/local-sim/README.md†L7-L14】
- Административные сценарии сгруппированы в `admin/features`, зеркально повторяя страницы UI и инкапсулируя бизнес-логику, события и фикстуры. 【F:dodepus-casino/local-sim/README.md†L15-L21】
- Общая инфраструктура (`api/`, `logic/`, `seed/`, `tables/`) обеспечивает доступ к данным, нормализацию и первоначальное заполнение. 【F:dodepus-casino/local-sim/README.md†L22-L27】

Документ следует использовать как стартовую точку: более подробные сведения о каждой папке доступны в README-файлах самих каталогов.
