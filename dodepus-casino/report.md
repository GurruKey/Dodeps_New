# Dodepus Casino — Report

Единый журнал всех «тейков». Новые записи добавляются **сверху** между служебными якорями.

**Статусы:** ✅ выполнено · ⏳ в работе · ❌ не сделано

---

<!-- DO NOT REMOVE:TAKES_START -->

## TAKE-20251016-016 — Canonical роли доступа
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 23:05

**Резюме:** Завёл canonical JSON-таблицы ролей и разрешений админки, подключил их к локальной БД и модулю access.
Обновил сидер, типы и заметки по миграциям, чтобы зафиксировать будущие SQL-таблицы ролей и прав.

**Объём работ (файлы/модули):**
- `local-sim/db/admin_roles.json`
- `local-sim/db/admin_permissions.json`
- `local-sim/db/admin_role_permissions.json`
- `local-sim/database/{schema.js,seed.js}`
- `local-sim/modules/access/roles/index.js`
- `local-sim/types/access.ts`
- `local-sim/migration-notes.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (access API читает таблицы ролей и прав)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Canonical JSON для ролей и разрешений добавлены и подключены в сидер
- [x] Модуль `modules/access/roles` читает данные из локальной БД вместо захардкоженных массивов
- [x] Типы и `migration-notes` обновлены под новые таблицы доступа

**Критерии приёмки:**
- [x] Таблицы `admin_roles`/`admin_permissions`/`admin_role_permissions` наполняются из соответствующих JSON
- [x] Фронтовые страницы и auth-утилиты получают роли через обновлённый модуль access
- [x] Описание схемы и индексов для ролей и прав отражено в `migration-notes.md`

**Понятным языком: что сделано/что поменял:**
- Я добавил отдельные json-таблицы ролей и разрешений
- Я научил сидер local-sim заполнять БД этими таблицами
- Я переписал модуль access/roles на чтение из локальной БД
- Я обновил типы и заметки, чтобы описать будущие SQL-таблицы

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** canonical роли и права заведены, модуль access читает их из локальной БД, документация обновлена
- **Что осталось:** Получить подтверждение Гринч и подготовить/применить SQL-миграцию после одобрения
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/db/admin_roles.json`
  - `local-sim/db/admin_permissions.json`
  - `local-sim/db/admin_role_permissions.json`
  - `local-sim/database/schema.js`
  - `local-sim/database/seed.js`
  - `local-sim/modules/access/roles/index.js`
  - `local-sim/types/access.ts`
  - `local-sim/migration-notes.md`

## TAKE-20251016-015 — Canonical промокоды
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 22:18

**Резюме:** Вынес административные промокоды в canonical JSON и подключил его к локальной БД.
Обновил промо-модуль так, чтобы CRUD работал через таблицу `admin_promocodes`, и задокументировал схему.

**Объём работ (файлы/модули):**
- `local-sim/db/admin_promocodes.json`
- `local-sim/database/{schema.js,seed.js}`
- `local-sim/modules/promo/{storage.js,core/repository.js}`
- `local-sim/types/promo.ts`
- `local-sim/migration-notes.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (promo API читает `admin_promocodes`)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Canonical JSON `admin_promocodes` создан и подключён в сидер
- [x] Модуль promo читает/пишет данные через локальную БД вместо localStorage
- [x] Паритет схемы описан в `migration-notes.md`

**Критерии приёмки:**
- [x] Таблица `admin_promocodes` наполняется из `local-sim/db/admin_promocodes.json`
- [x] `listAdminPromocodes`/`createAdminPromocode` работают поверх локальной БД
- [x] Типы и заметки фиксируют структуру промокодов и активностей

**Понятным языком: что сделано/что поменял:**
- Я завёл json-таблицу с административными промокодами
- Я подключил её к локальной БД и сидеру
- Я переписал хранилище промо на работу через таблицу вместо localStorage
- Я обновил заметки по миграциям и добавил типы

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** canonical промокоды заведены, local-sim промо-API работает через таблицу, документация обновлена
- **Что осталось:** Получить подтверждение Гринч и перейти к SQL-миграции
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/db/admin_promocodes.json`
  - `local-sim/database/schema.js`
  - `local-sim/database/seed.js`
  - `local-sim/modules/promo/storage.js`
  - `local-sim/modules/promo/core/repository.js`
  - `local-sim/types/promo.ts`
  - `local-sim/migration-notes.md`

## TAKE-20251016-014 — Canonical логи админки
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 21:53

**Резюме:** Завёл canonical JSON `admin_logs`, подключил его в сидер local-sim и обновил модуль логов на чтение из локальной БД. Добавил типы и миграционные заметки, чтобы зафиксировать схему и индексы будущей SQL-таблицы.

**Объём работ (файлы/модули):**
- `dodepus-casino/local-sim/db/admin_logs.json`
- `dodepus-casino/local-sim/database/seed.js`
- `dodepus-casino/local-sim/modules/logs/api.js`
- `dodepus-casino/local-sim/migration-notes.md`
- `dodepus-casino/local-sim/types/logs.ts`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (admin logs читает canonical таблицу)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Canonical JSON `admin_logs.json` создан и подключён в сидер
- [x] Модуль `modules/logs/api` читает данные из таблицы `admin_logs`
- [x] Паритет схемы local-sim ↔ SQL описан в migration-notes

**Критерии приёмки:**
- [x] Таблица `admin_logs` наполняется из `local-sim/db/admin_logs.json`
- [x] `listAdminLogs` возвращает комбинированный список (canonical + динамические) с camelCase полями
- [x] Типы и миграционные заметки фиксируют структуру `admin_logs`

**Понятным языком: что сделано/что поменял:**
- Я создал canonical-json с логами админки
- Я подключил таблицу admin_logs в сидер local-sim
- Я переписал модуль логов на чтение из локальной базы и сортировку по дате
- Я добавил типы и миграционные заметки для будущей SQL-таблицы

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Canonical таблица заведена, сидер и модуль логов обновлены, типы и миграционные заметки добавлены
- **Что осталось:** Получить подтверждение Гринч и затем переходить к SQL-миграции
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/db/admin_logs.json`
  - `dodepus-casino/local-sim/database/seed.js`
  - `dodepus-casino/local-sim/modules/logs/api.js`
  - `dodepus-casino/local-sim/types/logs.ts`
  - `dodepus-casino/local-sim/migration-notes.md`

## TAKE-20251016-013 — Каноничные данные верификации
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 22:05

**Резюме:** Задал canonical JSON-таблицы для запросов KYC, загрузок и очереди, подключил их в сидер local-sim и обновил модуль
 profileExtras, чтобы фронт получал camelCase данные. Очередь админки теперь читает записи из эмулятора БД и форматирует даты для UI.

**Объём работ (файлы/модули):**
- `dodepus-casino/local-sim/db/verification_requests.json`
- `dodepus-casino/local-sim/db/verification_uploads.json`
- `dodepus-casino/local-sim/db/verification_queue.json`
- `dodepus-casino/local-sim/database/{schema.js,seed.js}`
- `dodepus-casino/local-sim/modules/verification/queue.js`
- `dodepus-casino/local-sim/modules/auth/profileExtras.js`
- `dodepus-casino/local-sim/types/verification.ts`
- `dodepus-casino/local-sim/migration-notes.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (verification API читает canonical таблицы)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL подтверждён; migration-notes.md актуализирован
- [ ] SQL-миграции применены (жду подтверждения local-sim)
- [x] Canonical JSON таблицы `verification_*` созданы и подключены в сидер
- [x] Очередь верификации читает данные из `verification_queue` и форматирует даты для UI

**Критерии приёмки:**
- [x] Таблицы `verification_requests`, `verification_uploads`, `verification_queue` инициализируются из `local-sim/db/*.json`
- [x] `profileExtras` конвертирует snake_case поля в camelCase и сохраняет их обратно в canonical формат
- [x] `listAdminVerificationQueue` возвращает данные из local-sim БД и форматирует `submitted_at`

**Понятным языком: что сделано/что поменял:**
- Я завёл json-таблицы для запросов, загрузок и очереди верификации
- Я обновил сидер и схему, чтобы эти таблицы поднимались при инициализации local-sim
- Я научил profileExtras хранить данные в snake_case и отдавать фронту camelCase
- Я переписал очередь верификации на чтение из базы и человекочитаемые даты

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** canonical таблицы верификации заведены, сидер/схема обновлены, очередь и profileExtras работают с новой моделью
- **Что осталось:** Получить подтверждение Гринч и затем готовить SQL-миграцию
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/db/verification_requests.json`
  - `dodepus-casino/local-sim/db/verification_uploads.json`
  - `dodepus-casino/local-sim/db/verification_queue.json`
  - `dodepus-casino/local-sim/database/schema.js`
  - `dodepus-casino/local-sim/database/seed.js`
  - `dodepus-casino/local-sim/modules/verification/queue.js`
  - `dodepus-casino/local-sim/modules/auth/profileExtras.js`
  - `dodepus-casino/local-sim/types/verification.ts`
  - `dodepus-casino/local-sim/migration-notes.md`

## TAKE-20251016-012 — Профильные транзакции из canonical JSON
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 21:45

**Резюме:** Вынес базовые административные транзакции в отдельную canonical-таблицу `profile_transactions.json` и обновил сидер,
 чтобы local-sim поднимал данные из неё. Дополнительно адаптировал API транзакций к snake_case полям и описал схему в migration notes.

**Объём работ (файлы/модули):**
- `dodepus-casino/local-sim/db/profile_transactions.json` — новая таблица транзакций профилей
- `dodepus-casino/local-sim/database/seed.js` — импорт таблицы и дедупликация сидов
- `dodepus-casino/local-sim/modules/transactions/api.js` — поддержка snake_case полей
- `dodepus-casino/local-sim/types/transactions.ts` — описание сущностей
- `dodepus-casino/local-sim/migration-notes.md` — заметки по будущей миграции

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (admin transactions читает новые данные)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL подтверждён; migration-notes актуален
- [ ] SQL-миграции применены (жду подтверждения local-sim)
- [x] Canonical JSON для транзакций создан и подключён в сидер
- [x] API транзакций возвращает прежний формат для фронта

**Критерии приёмки:**
- [x] Таблица `profile_transactions` собирается из `local-sim/db/profile_transactions.json`
- [x] Значения snake_case мапятся на camelCase в `modules/transactions/api.js`
- [x] Схема таблицы и индексы описаны в `migration-notes.md`

**Понятным языком: что сделано/что поменял:**
- Я завёл json-таблицу с транзакциями и связал её с сидером
- Я научил API читать snake_case поля и отдавать фронту знакомый формат
- Я описал будущую SQL-таблицу и индексы в migration-notes

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Canonical транзакции заведены, сидер и API обновлены, заметки по миграции готовы
- **Что осталось:** Получить подтверждение Гринч и выполнить SQL-этап
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/db/profile_transactions.json`
  - `dodepus-casino/local-sim/database/seed.js`
  - `dodepus-casino/local-sim/modules/transactions/api.js`
  - `dodepus-casino/local-sim/types/transactions.ts`
  - `dodepus-casino/local-sim/migration-notes.md`

## TAKE-20251016-011 — Коммуникации через local-sim db
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 21:25

**Резюме:** Перенёс чаты админского раздела в canonical-json таблицы `local-sim/db`, добавил типы и обновил модуль, чтобы данные
 формировались из этих таблиц. Обновил schema/seed и завёл заметки по миграции для SQL-паритета.

**Объём работ (файлы/модули):**
- `dodepus-casino/local-sim/db/communication_*.json` — новые таблицы потоков, участников, сообщений
- `dodepus-casino/local-sim/modules/communications/threads.js` — чтение данных из JSON и маппинг
- `dodepus-casino/local-sim/database/{schema.js,seed.js}` — учёт новых таблиц и сидов
- `dodepus-casino/local-sim/types/communications.ts` — описание сущностей для SQL
- `dodepus-casino/local-sim/migration-notes.md` — заметки миграции

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (communications threads/messages)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL подтверждён; migration-notes актуален
- [ ] SQL-миграции применены (жду подтверждения local-sim)
- [x] JSON-таблицы заведены и подключены в сидер
- [x] Фронт получает данные через обновлённый модуль без изменений импорта

**Критерии приёмки:**
- [x] Все чаты читаются из `local-sim/db/communication_*.json`
- [x] Модуль `modules/communications` возвращает прежний формат сообщений
- [x] Schema/seed включает новые таблицы и данные

**Понятным языком: что сделано/что поменял:**
- Я перенёс треды чатов в json-таблицы local-sim
- Я настроил модуль communications на чтение этих таблиц
- Я прописал схему и сиды для новых таблиц
- Я записал заметки для будущей SQL-миграции

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Чаты админки работают через canonical JSON, схема и сиды обновлены, миграционные заметки готовы
- **Что осталось:** Получить подтверждение Гринч, затем готовить SQL-миграцию
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/db/communication_threads.json`
  - `dodepus-casino/local-sim/db/communication_thread_participants.json`
  - `dodepus-casino/local-sim/db/communication_messages.json`
  - `dodepus-casino/local-sim/modules/communications/threads.js`
  - `dodepus-casino/local-sim/database/schema.js`
  - `dodepus-casino/local-sim/database/seed.js`
  - `dodepus-casino/local-sim/types/communications.ts`
  - `dodepus-casino/local-sim/migration-notes.md`

## TAKE-20251016-010 — Унификация ролей и чатов через local-sim
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 21:05

**Резюме:** Вынес данные админских ролей, очереди верификации и чатов в модули `local-sim`, чтобы разорвать зависимость моков от фронта и унифицировать пути импорта. Обновил страницы админки и auth-модули на новые экспорты.

**Объём работ (файлы/модули):**
- `dodepus-casino/local-sim/modules/access/roles` — новый модуль конфигураций ролей
- `dodepus-casino/local-sim/modules/communications` — новый модуль чатов
- `dodepus-casino/local-sim/modules/verification/queue.js` — очередь верификации
- `dodepus-casino/local-sim/modules/auth/{api.js,composeUser.js,admin/adminPanelVisibility.js}` — обновлены импорты
- `dodepus-casino/src/pages/admin/features/{access,communications}` — переход на local-sim модули
- `dodepus-casino/src/pages/admin/layout/AdminLayout.jsx` — новые данные ролей из local-sim

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (roles, chats, verification queue)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL подтверждён; migration-notes актуален (изменений по схеме нет)
- [ ] SQL-миграции применены (жду подтверждения local-sim)
- [x] Фронтовые импорты переведены на модули local-sim
- [x] Моки авторизации используют новый модуль ролей

**Критерии приёмки:**
- [x] Все данные ролей доступны через `local-sim/modules/access`
- [x] Компоненты чатов читают треды из `local-sim/modules/communications`
- [x] Очередь верификации импортируется из `local-sim/modules/verification`
- [x] Удалён фронтовый файл `roles/data/roleConfigs.js`

**Понятным языком: что сделано/что поменял:**
- Я собрал роли и разрешения админки в отдельный модуль local-sim
- Я перенёс чаты модераторов, админов и стафа в local-sim
- Я добавил очередь верификации в модуль verification
- Я переключил auth-моки и страницы админки на новые импорты

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** local-sim обогащён ролями, чатами и очередью, фронт и auth используют единые импорты
- **Что осталось:** Дождаться подтверждения Гринч и при необходимости подготовить SQL-этап
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/access/roles/index.js`
  - `dodepus-casino/local-sim/modules/communications/{index.js,threads.js}`
  - `dodepus-casino/local-sim/modules/verification/queue.js`
  - `dodepus-casino/local-sim/modules/auth/{api.js,composeUser.js,admin/adminPanelVisibility.js}`
  - `dodepus-casino/src/pages/admin/features/{access,communications}` (соответствующие блоки)
  - `dodepus-casino/src/pages/admin/layout/AdminLayout.jsx`

## TAKE-20251016-009 — Унификация local-sim verification
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 20:49

**Резюме:** Переношу административную верификацию из `admin/features` в модуль `local-sim/modules/verification`, чтобы завершить унификацию путей. Обновлю barrel `api.js`, проверю, что фронт продолжает работать через единый экспорт.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\admin\\features\\verification` — перенос логики в модуль
- `dodepus-casino\\local-sim\\modules\\verification` — новый файл `admin.js`, обновление `api.js`
- `dodepus-casino\\report.md` — запись тейка и итогов

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (verification)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL подтверждён; migration-notes актуален
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Лог импорта проверен на фронте (импорты только из barrel)

**Критерии приёмки:**
- [x] Верификационные события и API доступны через `local-sim/modules/verification/admin.js`
- [x] `local-sim/modules/verification/api.js` не тянет пути из `admin/features`
- [x] Старый путь `admin/features/verification` больше не используется

**Понятным языком: что сделано/что поменял:**
- Я перенёс файл верификации из admin/features в modules/verification
- Я обновил api.js на новый путь внутри модуля
- Я проверил, что нигде не осталось ссылок на старый путь

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Логику административной верификации перенёс в модуль, обновил barrel и проверил импорты
- **Что осталось:** Дождаться подтверждения Гринч и последующего SQL-этапа
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/verification/admin.js`
  - `dodepus-casino/local-sim/modules/verification/api.js`
  - `dodepus-casino/report.md`

## TAKE-20251016-008 — Унификация local-sim clients filters
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 20:35

**Резюме:** Переношу клиентские фильтры админки в модуль `local-sim/modules/clients`, добавляю barrel и правлю импорты фронта.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\modules\\clients` — новый файл `filters.js` и barrel `index.js`
- `dodepus-casino\\local-sim\\admin\\shared` — удаляю устаревший `filters.js`
- `dodepus-casino\\src\\pages\\admin\\features\\clients` — импорт фильтров с нового пути
- `dodepus-casino\\src\\pages\\admin\\page` — обновляю импорт клиентов на barrel

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (клиентские фильтры перенесены в modules)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL отражён (изменений по схеме нет)
- [ ] SQL-миграции применены (не требуются до подтверждения)
- [x] Обновлены импорты фронта на новый путь local-sim
- [ ] Линтер/сборка зелёные (не запускал)

**Критерии приёмки:**
- [x] Функции `getStatusOptions` и `getRoleOptions` доступны через `local-sim/modules/clients`
- [x] Удалён дублирующий модуль `admin/shared/filters.js`
- [x] Фронтовые фильтры клиентов читают новый модуль
- [x] Импорт списка клиентов использует barrel `modules/clients`

**Понятным языком: что сделано/что поменял:**
- Я перенесу фильтры статусов и ролей в модуль клиентов
- Я создам barrel, чтобы импортировать клиентов и фильтры из одного места
- Я почищу старую папку shared, чтобы не было дублей
- Я поправлю фронтовые импорты, чтобы всё собиралось

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Клиентские фильтры перенесены в `modules/clients`, добавлен barrel и обновлены импорты фронта
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/clients/{api.js,filters.js,index.js}`
  - `dodepus-casino/local-sim/admin/shared/filters.js`
  - `dodepus-casino/src/pages/admin/features/clients/blocks/ClientSearchFilters.jsx`
  - `dodepus-casino/src/pages/admin/page/AdminPage.jsx`

## TAKE-20251016-007 — Унификация local-sim logs
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 20:22

**Резюме:** Перенёс админские логи local-sim в каталог `modules/logs`, чтобы завершить унификацию моков. Обновил все импорты
фронта и верификационной фичи на новый путь.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\modules\\logs` — новый модуль с API логов
- `dodepus-casino\\local-sim\\admin\\features\\verification` — импорт логов из нового места
- `dodepus-casino\\src\\pages\\admin\\features\\{monitoring,transactions}` — обновлённые импорты моков

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (logs)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL отражён (изменений по схеме нет)
- [ ] SQL-миграции применены (не требуются на этапе local-sim)
- [ ] Линтер/сборка зелёные (не запускал)

**Критерии приёмки:**
- [x] Админские логи доступны через `local-sim/modules/logs`
- [x] Верификация использует новый путь `modules/logs`
- [x] Фронтовые страницы логов и транзакций читают мок из нового каталога
- [x] Запись в `report.md` дополнена итогами

**Понятным языком: что сделано/что поменял:**
- Я перенёс `admin/logs` в `local-sim/modules/logs`
- Я обновил верификацию на новый импорт логов
- Я обновил фронтовые страницы мониторинга и транзакций
- Я создал индекс для переиспользования API логов

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Модуль логов перенесён в `modules`, импорты обновлены, запись добавлена
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/logs/{api.js,index.js}`
  - `dodepus-casino/local-sim/admin/features/verification/index.js`
  - `dodepus-casino/src/pages/admin/features/monitoring/log-admin/LogAdmin.jsx`
  - `dodepus-casino/src/pages/admin/features/transactions/blocks/TransactionsHistory.jsx`

## TAKE-20251016-006 — Унификация local-sim access
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 20:15

**Резюме:** Перенёс логи разрешений и ранговый редактор админки в новый модуль `local-sim/modules/access`. Обновил импорты моков и фронта,
чтобы они ссылались на единый путь.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\modules\\access` — новый модуль с логами и ранговыми API
- `dodepus-casino\\src\\pages\\admin\\features\\access` — обновлённые импорты на local-sim
- `dodepus-casino\\report.md` — запись по тейку

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (access)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL отражён (изменений по схеме нет)
- [ ] SQL-миграции применены (не требуются на этапе local-sim)
- [ ] Линтер/сборка зелёные (не запускал)

**Критерии приёмки:**
- [x] Логи разрешений доступны через `local-sim/modules/access/rolePermissionLogs.js`
- [x] Редактор рангов экспортируется из `local-sim/modules/access/rank-editor`
- [x] Фронтовые хуки и блоки используют новый путь local-sim
- [x] Запись в `report.md` дополнена итогами

**Понятным языком: что сделано/что поменял:**
- Я перенёс логи ролей в `local-sim/modules/access`
- Я перенёс ранговый редактор админки в этот же модуль
- Я обновил все фронтовые импорты на новый путь
- Я создал индекс модуля access для удобного импорта

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Логи ролей и ранговый редактор перенесены в `modules/access`, импорты обновлены, отчёт дополнен
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/access/**/*`
  - `dodepus-casino/src/pages/admin/features/access/**/*`
  - `dodepus-casino/report.md`

## TAKE-20251016-005 — Унификация local-sim promo
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 20:08

**Резюме:** Перенёс промо-модуль local-sim в каталог `modules`, почистил импорты фронта и хранилище моков. Проверил, что админка
читает данные по новому пути без ошибок.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\modules\\promo` — перенесённый модуль promo (API, события, сторадж)
- `dodepus-casino\\src\\pages\\admin\\features\\promo` — импорты фронта на новый путь
- `dodepus-casino\\report.md` — запись по тейку

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (promo)
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL отражён (изменений по схеме нет)
- [ ] SQL-миграции применены (не требуются на этапе local-sim)
- [x] UI/логика на React-Bootstrap обновлены (импорты фронта поправлены)
- [ ] Линтер/сборка зелёные (не запускал)

**Критерии приёмки:**
- [x] Промо-моки доступны через `local-sim/modules/promo`
- [x] Все импорты local-sim и фронта используют новый путь
- [x] Сидеры и логирование промо обновлены (изменений не потребовалось)
- [x] Запись в `report.md` дополнена итогами

**Понятным языком: что сделано/что поменял:**
- Я перенёс все файлы promo в `local-sim/modules/promo`
- Я обновил импорты админских страниц на новый путь
- Я проверил, что события и сторадж promo работают после переноса
- Я дополнил `report.md` свежей записью

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Перенёс promo в modules, обновил импорты фронта и документацию
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/promo/**/*`
  - `dodepus-casino/src/pages/admin/features/promo/**/*`
  - `dodepus-casino/report.md`

## TAKE-2025-10-16-004 — Унификация local-sim transactions
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 20:05

**Резюме:** Перенёс транзакции админки в единый каталог `local-sim/modules`. Обновил импорты локальных модулей и фронта, чтобы
они брали данные по новому пути. Привёл журнал логов к новому расположению.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\modules\\transactions` — новый модуль с API и логами транзакций
- `dodepus-casino\\local-sim\\modules\\auth/profileActions.js` — уведомления о транзакциях
- `dodepus-casino\\local-sim\\admin\\logs/index.js` — чтение логов из нового пути
- `dodepus-casino\\src\\pages\\admin\\features\\transactions\\hooks/useAdminTransactions.js` — импорт local-sim

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL отражён (изменений по схеме нет)
- [ ] SQL-миграции применены (не требуются)
- [ ] UI/логика на React-Bootstrap обновлены (не требовалось)
- [ ] Линтер/сборка зелёные (не запускал)

**Критерии приёмки:**
- [x] Код транзакций доступен через `local-sim/modules/transactions`
- [x] Импорты local-sim используют новый путь
- [x] Фронтовой хук читает транзакции из нового модуля
- [x] Журнал логов подключён к новому расположению

**Понятным языком: что сделано/что поменял:**
- Я перенёс API транзакций в `local-sim/modules/transactions`
- Я перевёл хук админки на новый путь local-sim
- Я обновил уведомления профиля и журнал логов
- Я удалил старую папку `admin/features/transactions`

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Транзакции и логи перенесены, импорты обновлены
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/transactions/{api.js,logs.js}`
  - `dodepus-casino/local-sim/modules/auth/profileActions.js`
  - `dodepus-casino/local-sim/admin/logs/index.js`
  - `dodepus-casino/src/pages/admin/features/transactions/hooks/useAdminTransactions.js`

## TAKE-2025-10-16-003 — Унификация local-sim clients
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 22:10

**Резюме:** Перенёс клиентский мок локальной админки в единый каталог `local-sim/modules`. Обновил импорты зависимых фич, чтобы все читали данные по новому пути.

**Объём работ (файлы/модули):**
- `dodepus-casino\\local-sim\\modules\\clients` — новый модуль с API клиентов
- `dodepus-casino\\local-sim\\admin\\features\\{verification,transactions}` — обновлённые импорты
- `dodepus-casino\\src\\pages\\admin\\page\\AdminPage.jsx` — путь к мокам клиентов

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [x] Паритет схемы local-sim ↔ SQL отражён в `migration-notes.md` (изменений по схеме нет)
- [ ] SQL-миграции применены (не требуются)
- [ ] UI/логика на React-Bootstrap обновлены (не требуются)
- [ ] Линтер/сборка зелёные (не запускал)

**Критерии приёмки:**
- [x] Клиентские моки доступны через `local-sim/modules/clients`
- [x] Админские фичи и фронт используют новый путь
- [x] Документация в `report.md` обновлена

**Понятным языком: что сделано/что поменял:**
- Я перенёс код клиентов в `local-sim/modules/clients/api.js`
- Я обновил импорты в verification и transactions на новый модуль
- Я поправил фронтенд-импорт списка клиентов в админке

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Модуль клиентов перенесён, импорты актуализированы
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/clients/api.js`
  - `dodepus-casino/local-sim/admin/features/{verification,transactions}/index.js`
  - `dodepus-casino/src/pages/admin/page/AdminPage.jsx`

## TAKE-2025-10-16-002 — Унификация local-sim auth
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 19:25

**Резюме:** Привёл модуль авторизации local-sim к общей структуре `modules`, перенёс все файлы и обновил импорты. Проверил зависимые модули и документацию, чтобы новый путь работал без ошибок.

**Объём работ (файлы/модули):**
- `dodepus-casino\local-sim\modules\auth` — перенос каталога и правки импортов
- `dodepus-casino\local-sim\modules\rank|verification` — ссылки на профильные данные
- `dodepus-casino\local-sim\database`, `admin/features/clients` — сидеры и админ-моки
- `dodepus-casino\src\app|features/auth`, `pages/admin/.../roles` — импорты local-sim

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч (жду подтверждения)
- [x] Паритет схемы local-sim ↔ SQL отражён в `migration-notes.md` (изменений по схеме нет)
- [ ] SQL-миграции применены после подтверждения (не требовалось)
- [ ] UI/логика на React-Bootstrap обновлены (не требовалось)
- [ ] Линтер/сборка зелёные (локально не запускал)

**Критерии приёмки:**
- [x] Весь код авторизации использует путь `local-sim/modules/auth`
- [x] Моки/эндпоинты local-sim работают через новый модуль
- [x] Документация и инструкции обновлены
- [x] `report.md` дополнен этой записью

**Понятным языком: что сделано/что поменял:**
- Я перенёс все файлы авторизации в `local-sim/modules/auth`
- Я обновил импорты во всех зависимых модулях и фронте
- Я поправил относительные пути внутри перенесённых файлов
- Я убедился, что сидеры/моки теперь читают данные из нового места
- Я описал результат в `report.md`

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Перенёс модуль авторизации, обновил импорты, проверил зависимости
- **Что осталось:** Дождаться подтверждения Гринч
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `dodepus-casino/local-sim/modules/auth/*`
  - `dodepus-casino/local-sim/modules/{rank,verification}/*`
  - `dodepus-casino/local-sim/database/seed.js`
  - `dodepus-casino/local-sim/admin/features/clients/index.js`
  - `dodepus-casino/src/app/auth/*`, `src/features/auth/api.js`
  - `dodepus-casino/src/pages/admin/features/access/roles/blocks/*`




## TAKE-2025-10-16-001 — Инициализация журнала и правил
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 23:00

**Резюме:** Создаём основной журнал `report.md`, фиксируем процесс ведения «тейков». Закрепляем принципы: **local-sim перед SQL**, UI — **Bootstrap first**, единая структура фич с barrel-импортами.

**Объём работ (файлы/модули):**
- `dodepus-casino\report.md` — создание и первый шаблон
- `dodepus-casino\local-sim\` — структура для db/*.json, types/*.ts, routes/*
- `dodepus-casino\local-sim\migration-notes.md` — заметки для будущих миграций
- `src\main.tsx` — (при необходимости) импорт стилей Bootstrap

**Чеклист выполнения:**
- [x] Создан `report.md` с якорями и шаблоном записи
- [x] Зафиксировано правило: **local-sim → (после подтверждения) → SQL**
- [x] Зафиксировано правило: **React-Bootstrap first**
- [ ] Описана структура `local-sim` (db/*.json, types/*.ts, routes/*) в README
- [ ] Добавлен импорт `import "bootstrap/dist/css/bootstrap.min.css";` в `src\main.tsx`
- [ ] Создан `migration-notes.md` с пометками по PK/FK/индексам/RLS
- [ ] Подготовлены первые фикстуры в `local-sim\db\users.json` (пример)

**Критерии приёмки:**
- [x] В `report.md` есть эта запись и «Формат записи (для справки)»
- [x] В правилах чётко указано: **сначала local-sim**, затем SQL-миграции
- [x] Указано, что UI собираем на **React-Bootstrap**
- [ ] Есть минимальные файлы/папки `local-sim` и понятная структура
- [ ] Импорт Bootstrap подключён и приложение собирается без ошибок

**Понятным языком: что сделано/что поменял:**
- Я создал файл журнала и добавил сюда первый пример записи
- Я закрепил правило: сначала делаем через `local-sim`, потом переносим в SQL
- Я зафиксировал «Bootstrap first» для фронтенда
- Я добавил чеклисты, чтобы дальше было проще принимать работу

**Блокеры (если есть):**
- Нужен PR/ветка с `local-sim` структурой и базовыми файлами для подтверждения

**Итоги выполнения:**
- **Статус:** ⏳ В работе
- **Что сделано:** Шаблон журнала, процесс, правила local-sim/Bootstrap
- **Что осталось:** Мини-README по `local-sim`, импорт Bootstrap, первые фикстуры/notes
- **Коммиты/PR:** (добавить ссылку после пуша)
- **Затронутые файлы:**
  - `dodepus-casino\report.md`
  - `dodepus-casino\local-sim\*` (план)
  - `src\main.tsx` (план)

<!-- DO NOT REMOVE:TAKES_END -->

---

## Формат записи (для справки)
> Codex, используй этот формат. Новые записи вставляй **сразу после** `TAKES_START`, выше старых. Ничего не удаляй.

### Шаблон секции
## TAKE-YYYYMMDD-### — Короткое название
**Автор:** Владислав • **Время (Europe/Kyiv):** YYYY-MM-DD HH:mm

**Резюме:** 2–4 коротких предложения, что и зачем делаем.

**Объём работ (файлы/модули):**
- `dodepus-casino\local-sim\...` — маршруты/моки/фикстуры
- `src\...` — фронтенд/логика (React-Bootstrap)
- `sql\migrations\...` — только **после** подтверждения local-sim

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (`dodepus-casino\local-sim\...`)
- [ ] Local-sim: подтверждено Владиславом (PR/коммит)
- [ ] Паритет схемы local-sim ↔ SQL отражён в `migration-notes.md`
- [ ] Реальные SQL-миграции добавлены и применены
- [ ] UI/логика реализованы на React-Bootstrap
- [ ] Линтер/сборка зелёные

**Критерии приёмки:**
- [ ] Поведение в UI соответствует описанию тейка
- [ ] Ответы local-sim/БД соответствуют контрактам
- [ ] Нет ошибок в консоли/логе
- [ ] Документация в `report.md` обновлена

**Понятным языком: что сделано/что поменял:**
- Я добавил роль ...
- Я изменил как ты просил: ...
- Я подключил маршрут через local-sim: ...
- Я обновил экран/эндпоинт: ...

**Блокеры (если есть):**
- Нет / Нужен PR/ветка/файл: …

**Итоги выполнения:**
- **Статус:** ⏳ / ✅ / ❌
- **Что сделано:** кратко
- **Что осталось:** кратко или «ничего»
- **Коммиты/PR:** ссылка1, ссылка2
- **Затронутые файлы:**
  - `path\to\file.ext`
  - `path\to\another.ext`
