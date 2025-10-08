# `admin/features`

Каталог объединяет все страницы административной панели. Каждая подпапка соответствует отдельному разделу и содержит страницу (`index.js` → `*.jsx`), специализированные блоки, хуки и компоненты.

| Папка | Страница | Назначение |
| --- | --- | --- |
| `overview` | `Overview.jsx` | Дашборд состояния казино и быстрые метрики. |
| `clients` | `Clients.jsx` | Поиск и управление клиентами (таблица, фильтры, карточки). |
| `transactions` | `Transactions.jsx` | История операций, детализация платежей, загрузка через `useAdminTransactions`. |
| `verification` | `Verification.jsx` | Очередь заявок на KYC, модалка принятия решений, история действий. |
| `promo/list` | `PromoCodes.jsx` | Список активных промокодов, подписка на обновления. |
| `promo/create` | `PromoCodeCreate.jsx` | Конструктор нового промокода и справочник типов. |
| `promo/archive` | `PromoArchive.jsx` | Просмотр архива и управление статусами. |
| `access/roles` | `Roles.jsx` | Управление ролями и разрешениями. |
| `access/role-edit` | `RoleEdit.jsx` | Редактор прав с журналом изменений. |
| `communications/moderators-chat` | `ModeratorsChat.jsx` | Общение модераторов. |
| `communications/administrators-chat` | `AdministratorsChat.jsx` | Канал администраторов. |
| `communications/staff-chat` | `StaffChat.jsx` | Обсуждение для поддержки. |
| `monitoring/log-admin` | `LogAdmin.jsx` | Журнал действий персонала. |

Все страницы экспортируются через `admin/features/index.js`, поэтому маршруты могут импортировать разделы из одного файла.
