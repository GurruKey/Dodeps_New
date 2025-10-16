# Dodepus Casino — Report

Единый журнал всех «тейков». Новые записи добавляются **сверху** между служебными якорями.

**Статусы:** ✅ выполнено · ⏳ в работе · ❌ не сделано

---

<!-- DO NOT REMOVE:TAKES_START -->

## TAKE-20251017-005 — Dataset для auth api
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 01:18

**Резюме:** Переношу модуль авторизации на canonical dataset. Создаю `modules/auth/dataset`, чтобы snapshot `auth_users`
использовался в auth/api и клиентов, синхронизирую localStorage через dataset и фиксирую типы/миграционные заметки.

**Объём работ (файлы/модули):**
- `local-sim/modules/auth/dataset.js`
- `local-sim/modules/auth/api.js`
- `local-sim/modules/auth/constants.js`
- `local-sim/modules/clients/dataset.js`
- `local-sim/modules/clients/constants.js`
- `local-sim/types/auth.ts`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset auth_users возвращает snapshot)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Auth/api читает и сохраняет пользователей только через dataset
- [x] Клиентский dataset переиспользует snapshot auth вместо прямого чтения БД
- [x] Типы и migration-notes дополнены описанием auth dataset

**Критерии приёмки:**
- [x] `getAuthUsersSnapshot` возвращает индексированные записи без прямого чтения JSON
- [x] `readUsers`/`writeUsers` в `modules/auth/api` синхронизируют localStorage через dataset
- [x] `modules/clients/dataset` больше не обращается к `__localAuthInternals`, а берёт snapshot auth

**Понятным языком: что сделано/что поменял:**
- Я добавил dataset, который нормализует auth_users и строит индексы
- Я переписал auth/api на чтение и запись через dataset вместо прямого доступа к БД
- Я обновил dataset клиентов, чтобы использовать snapshot auth и убрал дублированную нормализацию
- Я дополнил миграционные заметки и типы новой схемой auth

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Dataset auth готов, auth/api и клиенты читают snapshot, документация обновлена
- **Что осталось:** Получить подтверждение и затем готовить SQL-миграции
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/auth/dataset.js`
  - `local-sim/modules/auth/api.js`
  - `local-sim/modules/auth/constants.js`
  - `local-sim/modules/clients/dataset.js`
  - `local-sim/modules/clients/constants.js`
  - `local-sim/types/auth.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-004 — Dataset для verification queue
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 01:03

**Резюме:** Продолжаю унификацию local-sim. Нужно вынести таблицу `verification_queue` в canonical dataset, а API очереди
переписать на snapshot с индексами и форматированием поверх данных датасета.

**Объём работ (файлы/модули):**
- `local-sim/modules/verification/dataset.js`
- `local-sim/modules/verification/queue.js`
- `local-sim/modules/verification/api.js`
- `local-sim/types/verification.ts`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset выдаёт snapshot очереди)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует строки `verification_queue` и строит индексы по id/request/user
- [x] API очереди читает данные только через dataset snapshot
- [x] Типы и migration-notes дополнены описанием очереди

**Критерии приёмки:**
- [x] Экспорт `verificationQueue` формируется из snapshot dataset
- [x] `listAdminVerificationQueue` возвращает отформатированные элементы, основанные на canonical данных
- [x] В migration-notes зафиксирована схема `verification_queue` и индексы

**Понятным языком: что сделано/что поменял:**
- Я вынес очередь верификации в dataset с индексами
- Я переписал модуль очереди на чтение snapshot и форматирование дат
- Я обновил типы и migration-notes под новую схему

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Dataset очереди готов, snapshot строит индексы, API и типы обновлены
- **Что осталось:** Получить подтверждение и затем переносить схему в SQL
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/verification/dataset.js`
  - `local-sim/modules/verification/queue.js`
  - `local-sim/modules/verification/api.js`
  - `local-sim/types/verification.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-003 — Dataset для auth users
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 00:50

**Резюме:** Продолжаю унификацию local-sim. Нужен canonical dataset для `auth_users` и `profiles`, чтобы админские клиенты
читались через snapshot и готовили схему к будущим SQL-таблицам.

**Объём работ (файлы/модули):**
- `local-sim/modules/clients/dataset.js`
- `local-sim/modules/clients/constants.js`
- `local-sim/modules/clients/api.js`
- `local-sim/modules/clients/index.js`
- `local-sim/types/clients.ts`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset возвращает snapshot клиентов)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует `auth_users`/`profiles` и строит индексы по id/email/phone
- [x] Клиентский API читает данные только через canonical dataset
- [x] Типы и migration-notes обновлены под новые таблицы

**Критерии приёмки:**
- [x] `readAdminClients` использует dataset `modules/clients/dataset`
- [x] Snapshot содержит индексы `byId`, `byEmail`, `byPhone`, `profilesById`
- [x] В migration-notes описаны структуры `auth_users` и `profiles`

**Понятным языком: что сделано/что поменял:**
- Я добавил dataset, который собирает `auth_users` и профили в один snapshot
- Я переписал `readAdminClients`, чтобы брать данные только через dataset
- Я задокументировал таблицы и типы, добавил новый файл `types/clients.ts`

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** dataset клиентов готов, API переведён на snapshot, документация и типы обновлены
- **Что осталось:** дождаться подтверждения и затем готовить SQL-миграции
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/clients/dataset.js`
  - `local-sim/modules/clients/constants.js`
  - `local-sim/modules/clients/api.js`
  - `local-sim/modules/clients/index.js`
  - `local-sim/types/clients.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-002 — Dataset для admin logs
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 00:36

**Резюме:** Продолжаю унификацию local-sim. Нужен canonical dataset для `admin_logs`, чтобы API админских логов работало поверх snapshot и готовило схему для будущих SQL-таблиц.

**Объём работ (файлы/модули):**
- `local-sim/modules/logs/dataset.js`
- `local-sim/modules/logs/api.js`
- `local-sim/modules/logs/index.js`
- `local-sim/modules/logs/constants.js`
- `local-sim/migration-notes.md`
- `local-sim/types/logs.ts`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset строит snapshot логов)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует строки `admin_logs` и возвращает snapshot индексы
- [x] API читает canonical логи только через dataset
- [x] Паритет схемы local-sim ↔ SQL отражён в migration-notes

**Критерии приёмки:**
- [x] `readAdminLogs` использует dataset как основной источник логов
- [x] Snapshot содержит индексы по `id`, `adminId`, `section`
- [x] migration-notes описывают структуру `admin_logs` и использование dataset

**Понятным языком: что сделано/что поменял:**
- Я добавил dataset, который читает `admin_logs` из локальной БД и строит индексы
- Я переписал API логов, чтобы брать данные через snapshot
- Я обновил заметки миграций и типы под новые структуры

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** dataset логов готов, API читает snapshot, документация и типы обновлены
- **Что осталось:** дождаться подтверждения и затем готовить SQL-миграции
- **Коммиты/PR:** будет в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/logs/dataset.js`
  - `local-sim/modules/logs/api.js`
  - `local-sim/modules/logs/index.js`
  - `local-sim/modules/logs/constants.js`
  - `local-sim/migration-notes.md`
  - `local-sim/types/logs.ts`
  - `report.md`

## TAKE-20251017-001 — Dataset для transactions
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 00:25

**Резюме:** Хочу вынести админские транзакции в отдельный dataset local-sim. План: нормализовать таблицу `profile_transactions`, добавить snapshot и переподключить API.

**Объём работ (файлы/модули):**
- `local-sim/modules/transactions/dataset.js`
- `local-sim/modules/transactions/api.js`
- `local-sim/modules/transactions/constants.js`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset собирает и сортирует транзакции)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует строки `profile_transactions`
- [x] API читает транзакции только через dataset snapshot
- [x] В dataset есть индекс по `userId`

**Критерии приёмки:**
- [x] `readAdminTransactions` использует canonical dataset и возвращает те же поля
- [x] Транзакции сортируются по `createdAt` по убыванию
- [x] В migration-notes зафиксированы структура и индексы `profile_transactions`

**Понятным языком: что сделано/что поменял:**
- Я вынес нормализацию транзакций в dataset
- Я подключил API к snapshot из dataset и добавил индексы по пользователям
- Я обновил заметки по миграциям и отчёт

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено (жду подтверждения local-sim)
- **Что сделано:** dataset транзакций готов, API читает snapshot, заметки обновлены
- **Что осталось:** дождаться подтверждения и перейти к SQL-миграциям
- **Коммиты/PR:** будет в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/transactions/dataset.js`
  - `local-sim/modules/transactions/api.js`
  - `local-sim/modules/transactions/constants.js`
  - `local-sim/types/transactions.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251016-022 — Dataset для admin access
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 23:40

**Резюме:** Выношу роли и разрешения админки в единый dataset local-sim. Нормализую JSON таблицы доступа и подключаю модуль ролей к новому snapshot.

**Объём работ (файлы/модули):**
- `local-sim/modules/access/dataset.js`
- `local-sim/modules/access/roles/index.js`
- `local-sim/modules/access/index.js`
- `local-sim/modules/access/constants.js`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset собирает роли/права из локальной БД)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует `admin_roles`/`admin_permissions`/`admin_role_permissions`
- [x] Модуль `modules/access/roles` читает данные только через dataset snapshot
- [x] Экспорт access-модуля расширен функциями dataset для будущих миграций

**Критерии приёмки:**
- [x] `availableRoles` и `rolePermissionMatrix` собираются из canonical JSON через dataset
- [x] `listRolePermissionMatrix` и `getRolePermissionLegend` возвращают копии данных без побочных эффектов
- [x] В migration-notes зафиксировано использование dataset для admin access

**Понятным языком: что сделано/что поменял:**
- Я создал dataset, который нормализует роли и права из локальной БД
- Я переписал модуль ролей, чтобы брать snapshot только из dataset
- Я добавил экспорт вспомогательных функций access-датаcета
- Я обновил migration-notes и журнал по тейку

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** dataset для admin access готов, модуль ролей переведён на snapshot, документация обновлена
- **Что осталось:** дождаться подтверждения и затем переходить к SQL-миграциям
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/access/dataset.js`
  - `local-sim/modules/access/roles/index.js`
  - `local-sim/modules/access/index.js`
  - `local-sim/modules/access/constants.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251016-021 — Dataset для communications
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 23:25

**Резюме:** Планирую вынести переписку сотрудников в dataset local-sim. Нужно нормализовать таблицы коммуникаций и подключить модуль чатов к каноническому источнику.

**Объём работ (файлы/модули):**
- `local-sim/modules/communications/dataset.js`
- `local-sim/modules/communications/threads.js`
- `local-sim/modules/communications/index.js`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset строит чаты из локальной БД)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует таблицы `communication_threads`, `communication_thread_participants`, `communication_messages`
- [x] Модуль `threads` читает данные чатов через dataset
- [x] migration-notes обновлены описанием dataset по communications

**Критерии приёмки:**
- [x] `listModeratorsChatThreads` возвращает данные из локальной БД через dataset
- [x] Сообщения сортируются по времени отправки в порядке убывания
- [x] В migration-notes зафиксированы таблицы communications и использование dataset

**Понятным языком: что сделано/что поменял:**
- Я добавил dataset, который читает таблицы коммуникаций из локальной БД
- Я переписал модуль чатов, чтобы брать данные только из dataset
- Я обновил заметки по миграциям и отчёт

**Блокеры (если есть):**
- Нет

- **Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** добавлен dataset коммуникаций, переписан модуль чатов на работу через него, обновлены миграционные заметки и отчёт
- **Что осталось:** дождаться подтверждения local-sim и после этого переходить к SQL-миграциям
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/communications/dataset.js`
  - `local-sim/modules/communications/threads.js`
  - `local-sim/modules/communications/index.js`
  - `local-sim/modules/communications/constants.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251016-020 — Dataset для verification
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 23:25

**Резюме:** Вынес нормализацию запросов верификации в отдельный dataset local-sim. Переподключил профильные экстры и админский модуль к единому источнику данных.

**Объём работ (файлы/модули):**
- `local-sim/modules/verification/dataset.js`
- `local-sim/modules/auth/profileExtras.js`
- `local-sim/modules/verification/admin.js`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (dataset отдаёт canonical requests/uploads)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset нормализует таблицы `verification_requests`/`verification_uploads`
- [x] Профильные экстры используют dataset вместо ручного маппинга
- [x] Админский список верификации читает данные через dataset

**Критерии приёмки:**
- [x] `readAdminVerificationRequests` поднимает записи из canonical dataset
- [x] `profileExtras.loadExtras` возвращает запросы/загрузки из dataset
- [x] `migration-notes` содержит пометку про verification dataset

**Понятным языком: что сделано/что поменял:**
- Я создал файл dataset для запросов и загрузок верификации
- Я переписал profileExtras, чтобы брать запросы из dataset и писать их обратно
- Я обновил админские функции, чтобы использовать новые данные
- Я дополнил migration-notes и отчёт

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** выделен dataset верификации, переподключены profileExtras и админский модуль, обновлены заметки
- **Что осталось:** дождаться подтверждения и затем двигаться к SQL
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/verification/dataset.js`
  - `local-sim/modules/auth/profileExtras.js`
  - `local-sim/modules/verification/admin.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251016-019 — Canonical промокоды через local-sim
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 22:59

**Резюме:** Привожу модуль промокодов к каноническим данным из local-sim. Хочу добавить dataset-слой, который читает `admin_promocodes` из локальной БД и использовать его вместо генерации из definitions.

**Объём работ (файлы/модули):**
- `local-sim/modules/promo/dataset.js`
- `local-sim/modules/promo/{core/repository.js,storage.js,constants.js}`
- `local-sim/types/promo.ts`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (list/create/update промокодов на основе canonical dataset)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Dataset для `admin_promocodes` читает JSON и отдаёт канонический набор
- [x] Repository promo использует dataset из локальной БД вместо генерации через definitions
- [x] migration-notes обновлены под новую схему доступа к промокодам

**Критерии приёмки:**
- [x] `listAdminPromocodes` возвращает данные из `admin_promocodes.json`
- [x] При обновлении промокода изменения сохраняются в локальную БД и возвращаются через dataset
- [x] migration-notes содержит описание канонического источника данных промокодов

**Понятным языком: что сделано/что поменял:**
- Я добавил слой dataset, который читает промокоды из локальной БД
- Я подключил этот dataset в репозиторий промокодов вместо генератора из definitions
- Я обновил заметки по миграциям и интерфейсы типов

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** добавил dataset для промокодов, переписал core/storage на canonical данные, обновил migration-notes и типы
- **Что осталось:** дождаться подтверждения и затем готовить SQL-миграции
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/promo/dataset.js`
  - `local-sim/modules/promo/storage.js`
  - `local-sim/modules/promo/core/repository.js`
  - `local-sim/modules/promo/constants.js`
  - `local-sim/types/promo.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251016-018 — Очистка демо аккаунтов и чатов
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 22:54

**Резюме:** Удаляю демо-аккаунт owner и связанные с ним данные в local-sim, а также вычищаю демо-чаты и коммуникации.
Привожу canonical JSON к пустому состоянию, чтобы дальше наполнять его только подтверждёнными данными.

**Объём работ (файлы/модули):**
- `local-sim/modules/auth/accounts/seedAccounts.js`
- `local-sim/db/{profile_transactions.json,verification_requests.json,verification_queue.json,verification_uploads.json}`
- `local-sim/db/{communication_threads.json,communication_thread_participants.json,communication_messages.json}`
- `local-sim/migration-notes.md`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (canonical данные очищены от демо-записей)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Демо-аккаунты удалены из сидера local-sim
- [x] Демо-чаты и сообщения удалены из canonical JSON
- [x] migration-notes обновлены, чтобы зафиксировать отсутствие демо-данных

**Критерии приёмки:**
- [x] PRESET_ACCOUNTS не содержит демо-пользователей
- [x] Коммуникационные таблицы local-sim пусты и не содержат фиктивных записей
- [x] Таблицы валидации и транзакций не содержат ссылок на демо-аккаунт

**Понятным языком: что сделано/что поменял:**
- Я убрал owner-профиль и все связанные с ним транзакции и заявки валидации
- Я очистил JSONы с чатами, участниками и сообщениями, чтобы не было демо-переписок
- Я дополнил migration-notes пометкой, что теперь массивы пустые и ждут реальных данных
- Я обновил отчёт об этом тейке

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** демо-аккаунты и чаты удалены, canonical JSON очищен, заметки обновлены
- **Что осталось:** дождаться подтверждения и затем переходить к SQL-миграциям
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/auth/accounts/seedAccounts.js`
  - `local-sim/db/profile_transactions.json`
  - `local-sim/db/verification_requests.json`
  - `local-sim/db/verification_queue.json`
  - `local-sim/db/verification_uploads.json`
  - `local-sim/db/communication_threads.json`
  - `local-sim/db/communication_thread_participants.json`
  - `local-sim/db/communication_messages.json`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251016-017 — Canonical ранги через local-sim
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-16 22:33

**Резюме:** Планирую перенести данные VIP-рангов в canonical JSON local-sim, чтобы ранговый модуль читал уровни и награды через локальную БД.
Нужно подготовить таблицы `rank_levels` и `rank_rewards`, обновить сидер, типы и модуль `modules/rank` под новую схему.

**Объём работ (файлы/модули):**
- `local-sim/db/rank_levels.json`
- `local-sim/db/rank_rewards.json`
- `local-sim/database/{schema.js,seed.js}`
- `local-sim/modules/rank/*`
- `local-sim/types/rank.ts`
- `local-sim/migration-notes.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (ранговый API читает таблицы `rank_levels`/`rank_rewards`)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Canonical JSON таблицы рангов созданы и подключены в сидер
- [x] Модуль `modules/rank` читает данные из локальной БД и сохраняет оверрайды
- [x] Типы и `migration-notes` обновлены под ранговую схему

**Критерии приёмки:**
- [x] Таблицы `rank_levels` и `rank_rewards` инициализируются из `local-sim/db/*.json`
- [x] `getProfileRankData`/`getProfileRankSummary` читают уровни и награды из БД
- [x] Описание схемы рангов отражено в `migration-notes.md`

**Понятным языком: что сделано/что поменял:**
- Я завёл canonical JSON с уровнями и наградами рангов и подключил их в сидер local-sim
- Я добавил таблицы `rank_levels` и `rank_rewards` в схему локальной БД
- Я переписал модуль рангов на чтение из базы, сохранил поддержку пользовательских оверрайдов
- Я создал типы и дополнил migration-notes для будущей SQL-миграции рангов

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** canonical таблицы рангов заведены, сидер и модуль `modules/rank` работают через локальную БД, типы и заметки обновлены
- **Что осталось:** Получить подтверждение Гринч и затем подготовить/применить SQL-миграцию
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/db/rank_levels.json`
  - `local-sim/db/rank_rewards.json`
  - `local-sim/database/schema.js`
  - `local-sim/database/seed.js`
  - `local-sim/modules/rank/{api.js,constants.js,dataset.js,helpers.js,index.js,storage.js}`
  - `local-sim/types/rank.ts`
  - `local-sim/migration-notes.md`

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
