### 2025-10-16 18:40 — profile/index barrel и очистка заглушки
- Удалил устаревший `src/pages/Profile.jsx`, так как роут `/profile` теперь покрывает layout + вложенные вкладки.
- Создал `src/pages/profile/index.js` с именованными экспортами всех страниц и layout профиля.
- Обновил `AppRoutes.jsx`, чтобы тянуть компоненты профиля из нового barrel.

### 2025-10-16 18:20 — profile/layout/blocks/createNavItems JSX
- Переименовал createNavItems в .jsx, чтобы JSX корректно собирался Vite.
- Обновил импорт в ProfileSidebarBlock.jsx на новый путь.
- Проверил, что сайдбар продолжает рендерить бейджи через React-Bootstrap.
- Обновил Personal.jsx, чтобы рендерить существующие блоки профиля без битых импортов.

### 2025-10-16 18:00 — profile/history плейсхолдер
- History.jsx теперь проверяет наличие транзакций через useAuth и подставляет карточку или плейсхолдер.
- TransactionsBlock принимает массив транзакций и валюту, не рендерит карточку при пустом списке.
- Добавлен TransactionsPlaceholderBlock на базе ProfilePlaceholderBlock для пустой истории.

### 2025-10-16 17:30 — profile/layout/blocks/ProfilePlaceholderBlock плейсхолдеры
- Создал общий ProfilePlaceholderBlock с карточкой и центрированным содержимым.
- Подключил компонент в games-history/promos/season вместо отдельных карточек-заглушек.
- Теперь плейсхолдеры профиля выглядят одинаково и настраиваются из одного места.

### 2025-10-16 15:22 — profile/layout/blocks/ProfileSidebarBlock sticky
- Блок сайдбара теперь использует классы Bootstrap `sticky-top pt-3` вместо кастомного `.profile-sidebar`.
- Удалён CSS в src/index.css: позиционирование `position: sticky; top: 12px;` больше не требуется.
- Закрепление панели профиля теперь полностью на стандартных утилитах Bootstrap.

### 2025-10-16 17:05 — profile/layout/blocks/ProfileBlocksLayout структура
- Создан ProfileBlocksLayout: обёртка `d-grid` с configurable gap/as для всех вкладок профиля.
- Все страницы профиля используют новый layout вместо ручного `<div className="d-grid gap-3">`.
- Общий экспорт layout лежит в profile/layout/blocks/index.js рядом с ProfileSidebarBlock.

### 2025-10-16 16:45 — profile/layout/blocks/ProfileSidebarBlock структура
- SidebarNavLink вынесен в отдельный файл, чтобы переиспользовать Nav.Link логику.
- createNavItems.js хранит конфиг пунктов меню и бейджей баланса/верификации/ранга.
- meta.js считает данные бейджей, а основной компонент только собирает список ссылок.

### 2025-10-16 16:25 — profile/verification/modules структура
- В shared добавлен VerificationFormLayout: карточка/плейн-обёртка для форм с заголовком и `d-grid gap-3`.
- Email/Phone/Address/PersonalData формы и DocumentUploader теперь используют общий лейаут вместо ручного Card/`div`.
- Layout гарантирует единый отступ заголовков и контента в карточках и plain-режиме модалок.

### 2025-10-16 16:05 — profile/layout/blocks структура
- ProfileSidebarBlock теперь строит навигацию из массива `createNavItems`, разделители рисуются классами Bootstrap.
- SidebarNavLink отвечает за единый рендер Nav.Link с бейджами баланса, верификации и ранга.
- Конфигурация хранит пункты и позволяет быстро менять порядок и подписи без правки JSX.

### 2025-10-16 14:06 — profile/layout структура
- ProfileLayout.jsx теперь подключает ProfileSidebarBlock из `./blocks` и оставляет в себе только контейнер с Outlet.
- В `blocks/ProfileSidebarBlock/ProfileSidebarBlock.jsx` лежит навигация профиля с расчётом бейджа ранга и статуса верификации.
- `blocks/index.js` реэкспортирует ProfileSidebarBlock для использования в макете.

### 2025-10-16 13:57 — profile/verification структура
- Verification.jsx лежит в корне папки и собирает страницу через `d-grid gap-3`, подключая блоки из `./blocks`.
- В `blocks/ModuleStatusBlock/ModuleStatusBlock.jsx` — крупный блок статусов модулей с формами и модальным окном.
- В `blocks/VerificationHistoryBlock/VerificationHistoryBlock.jsx` — таблица отправленных файлов верификации.
- `blocks/index.js` реэкспортирует оба блока для использования на странице.

### 2025-10-16 15:30 — profile/wallet структура
- Wallet.jsx теперь использует d-grid gap-3 и подключает блоки через ./blocks, без ручных row.
- BalancesRowBlock.jsx собирает две колонки Bootstrap с RealBalanceBlock и WithdrawableBlock.
- blocks/index.js реэкспортирует новый блок вместе с существующими компонентами кошелька.

### 2025-10-16 15:05 — profile/terminal структура
- Terminal.jsx использует `d-grid gap-3`, чтобы соответствовать сетке профиля.
- Внутри лежит `Row` с `flex-row-reverse`, который рендерит DepositBlock и WithdrawBlock по колонкам.
- Папка `blocks` содержит компоненты депозит/вывод и индекс для их импорта в Terminal.jsx.

### 2025-10-16 14:45 — profile/rank структура
- ProfileRank.jsx использует `d-grid gap-3` и подключает блоки через `./blocks`.
- В `blocks/RankProgressBlock/RankProgressBlock.jsx` и `blocks/RankRewardsBlock/RankRewardsBlock.jsx` лежат карточки прогресса и наград.
- `blocks/index.js` реэкспортирует оба блока для удобного импорта в ProfileRank.jsx.

### 2025-10-16 14:20 — profile/personal структура
- Personal.jsx использует `d-grid gap-3`, чтобы выровнять блоки по шаблону профиля.
- В `blocks` уже лежат компоненты для каждого блока личных данных, их структура не менялась.
- Индекс `blocks/index.js` продолжает реэкспортировать все блоки для подключения в Personal.jsx.

### 2025-10-16 13:21 — profile/promos структура
- Promos.jsx собирает страницу через `d-grid gap-3`, подключая блоки из `./blocks`.
- В `blocks/PromosPlaceholderBlock/PromosPlaceholderBlock.jsx` лежит карточка-заглушка на React-Bootstrap.
- `blocks/index.js` реэкспортирует PromosPlaceholderBlock для использования в Promos.jsx.
- Структура папки теперь совпадает с другими вкладками профиля (главный компонент + blocks + index.js).
### 2025-10-16 14:05 — profile/history структура
- History.jsx использует `d-grid gap-3` для размещения блоков как в других вкладках профиля.
- В `blocks/TransactionsBlock` лежит карточка истории транзакций на React-Bootstrap с таблицей.
- `blocks/index.js` реэкспортирует TransactionsBlock для подключения в History.jsx.
### 2025-10-16 13:40 — profile/games-history структура
- GamesHistory.jsx теперь собирает страницу через `d-grid gap-3` и блок `GamesHistoryPlaceholderBlock`.
- В папке `blocks` лежит `GamesHistoryPlaceholderBlock/GamesHistoryPlaceholderBlock.jsx` и `index.js` для реэкспорта.
- Блок построен на `Card` из React-Bootstrap с заглушкой о пустой истории.
### 2025-10-16 13:05 — profile/season структура
- Season.jsx теперь собирает страницу через `d-grid gap-3` и блок `SeasonOverviewBlock`.
- В папке `blocks` лежит `SeasonOverviewBlock/SeasonOverviewBlock.jsx` и `index.js` для реэкспорта.
- Блок строится на `Card` из React-Bootstrap и заменяет прямой JSX в Season.jsx.
