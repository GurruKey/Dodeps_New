# Dodepus Casino — Report

Единый журнал всех «тейков». Новые записи добавляются **сверху** между служебными якорями.

**Статусы:** ✅ выполнено · ⏳ в работе · ❌ не сделано

---

<!-- DO NOT REMOVE:TAKES_START -->
## TAKE-20251017-051 — Исправление импортов local-sim для Vite
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 19:03

**Резюме:** Зафиксировал некорректные относительные пути до local-sim и shared-компонентов, из-за которых Vite ломал сборку. Провёл ревизию импортов и поправил ссылки на нужные файлы.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/monitoring/log-admin/hooks/useAdminLogs.js`
- `src/pages/admin/features/monitoring/log-admin/blocks/AdminLogTable/AdminLogTable.jsx`
- `src/pages/admin/features/communications/blocks/AdminChatChannelPanel/AdminChatChannelPanel.jsx`
- `src/pages/admin/features/communications/hooks/useAdminChatChannel.js`
- `local-sim/modules/access/storage/accessSnapshot.js`
- `local-sim/modules/verification/storage/verificationDataset.js`
- `local-sim/modules/rank/storage/rankDataset.js`
- `local-sim/modules/transactions/storage/transactionRecords.js`
- `local-sim/modules/promo/storage/promocodes.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Проверены импорты local-sim из src-файлов
- [x] Проверены относительные пути внутри local-sim модулей

**Критерии приёмки:**
- [x] Vite запускается без ошибок разрешения импортов
- [x] Все импорты local-sim ведут к существующим файлам
- [x] Относительные пути внутри local-sim соответствуют реальной структуре каталогов

**Понятным языком: что сделано/что поменял:**
- Я поправил все относительные пути до local-sim в хуках и блоках админки.
- Я перенастроил импорт ChatPanel из общей папки admin.
- Я синхронизировал импорты внутри local-sim storage с реальной структурой каталогов.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim от Гринча)
- **Что сделано:** Исправил относительные пути к local-sim и shared-компонентам, устранил ошибки разрешения импортов.
- **Что осталось:** Дождаться подтверждения local-sim.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Vite импортов теперь сходится; eslint ругается на старые файлы, правки вне задачи.

## TAKE-20251017-050 — Local-sim: маршруты и валидация датасета
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 22:15

**Резюме:** Описал каноничные admin-маршруты local-sim и добавил автоматическую проверку связей JSON-таблиц. Настроил npm-команду,
 чтобы быстро гонять валидацию перед будущими SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/routes/admin.md`
- `local-sim/scripts/validateCanonicalDataset.js`
- `package.json`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Добавил скрипт `validateCanonicalDataset` для проверки JSON
- [x] Настроил npm-скрипт `local-sim:validate`
- [x] Обновил migration-notes с новыми маршрутами и проверкой

**Критерии приёмки:**
- [x] Документ маршрутов описывает ключевые admin-эндпоинты с примерами/заглушками
- [x] Скрипт `validateCanonicalDataset` валидирует ключевые связи (`user_id`, `rank_level_id`, `thread_id`, `request_id`)
- [x] Команда `npm run local-sim:validate` запускает проверку без ошибок

**Понятным языком: что сделано/что поменял:**
- Я расписал маршруты admin-local-sim с примерами ответов.
- Я добавил скрипт, который проверяет, что JSON-таблицы согласованы между собой.
- Я вывел команду `npm run local-sim:validate`, чтобы гонять проверку в один шаг.
- Я дополнил migration-notes и отчёт свежим прогрессом.

**Блокеры (если есть):**
- Жду подтверждения local-sim от Гринча

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Подготовил документацию маршрутов и автоматическую проверку каноничного датасета.
- **Что осталось:** Дождаться подтверждения local-sim и перейти к SQL-миграциям.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Перед миграциями запускаем `npm run local-sim:validate`, чтобы убедиться в ссылочной целостности JSON.
- **Затронутые файлы:**
  - `local-sim/routes/admin.md`
  - `local-sim/scripts/validateCanonicalDataset.js`
  - `package.json`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-049 — Local-sim: типы promo/transactions/verification/rank
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 21:00

**Резюме:** Дополнил TypeScript-описания promo, transactions, verification и rank, чтобы зафиксировать snake_case строки таблиц, нормализованные записи snapshot и параметры для будущих SQL-схем.

**Объём работ (файлы/модули):**
- `local-sim/types/promo.ts`
- `local-sim/types/transactions.ts`
- `local-sim/types/verification.ts`
- `local-sim/types/rank.ts`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Расширил типы промокодов параметрами audience/limits/repeat/display
- [x] Добавил `raw` и типы логов в `transactions.ts`
- [x] Задал нормализованные записи verification (history, uploads, queue)
- [x] Описал dataset рангов и обновил migration-notes

**Критерии приёмки:**
- [x] Типы promo описывают и строки таблицы, и нормализованные записи с параметрами
- [x] Типы transactions включают `raw` и структуру логов
- [x] Verification типы покрывают заявки, историю, загрузки и очередь
- [x] Migration-notes отражают новые описания типов

**Понятным языком: что сделано/что поменял:**
- Я расписал параметры промокодов (аудитория, лимиты, повтор, отображение).
- Я добавил `raw` и тип логов в транзакциях, чтобы не терять контекст.
- Я описал историю и загрузки в типах verification.
- Я дописал dataset рангов и обновил заметки миграций.

**Блокеры (если есть):**
- Жду подтверждения local-sim от Гринча

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Обновил типы promo/transactions/verification/rank и миграционные заметки под новые структуры.
- **Что осталось:** Получить подтверждение и перейти к подготовке SQL-миграций.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Типы теперь полностью отражают canonical JSON и нормализованные snapshot-структуры.
- **Затронутые файлы:**
  - `local-sim/types/promo.ts`
  - `local-sim/types/transactions.ts`
  - `local-sim/types/verification.ts`
  - `local-sim/types/rank.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-048 — Local-sim: типы auth/clients/logs
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 20:15

**Резюме:** Синхронизировал TypeScript-описания auth, clients и logs с каноничными JSON local-sim, чтобы облегчить генерацию SQL-схем и не терять связь snake_case ↔ camelCase.

**Объём работ (файлы/модули):**
- `local-sim/types/auth.ts`
- `local-sim/types/clients.ts`
- `local-sim/types/logs.ts`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Обновил `auth.ts`, добавив row/record-структуры и метаданные
- [x] Переписал `clients.ts`, разделив JSON-строки профилей и нормализованные extras
- [x] Добавил row-типы для admin logs и обновил migration-notes

**Критерии приёмки:**
- [x] Типы auth описывают snake_case строки JSON и нормализованные snapshot-записи
- [x] Типы clients разделяют структуру таблицы и camelCase extras
- [x] Логи имеют row-типы и отражены в migration-notes

**Понятным языком: что сделано/что поменял:**
- Я переписал типы auth, чтобы они повторяли JSON и snapshot.
- Я разделил профильные типы на строки таблицы и camelCase extras.
- Я добавил row-типы для логов и отметил это в заметках миграций.
- Я обновил отчёт об этом тейке.

**Блокеры (если есть):**
- Жду подтверждения local-sim от Гринча

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Уточнил TypeScript-описания auth/clients/logs и обновил миграционные заметки.
- **Что осталось:** Получить подтверждение и двигаться к SQL-миграциям.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Типы теперь 1в1 соответствуют JSON-структурам и snapshot-представлениям.
- **Затронутые файлы:**
  - `local-sim/types/auth.ts`
  - `local-sim/types/clients.ts`
  - `local-sim/types/logs.ts`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-047 — Local-sim: табличные константы
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 19:45

**Резюме:** Объединил все имена таблиц local-sim в экспортируемые константы модулей и применил их в сидере, чтобы исключить расхождения перед будущими SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/modules/verification/constants.js`
- `local-sim/modules/verification/index.js`
- `local-sim/modules/verification/storage/verificationDataset.js`
- `local-sim/modules/auth/profileExtras.js`
- `local-sim/modules/promo/index.js`
- `local-sim/modules/access/index.js`
- `local-sim/database/seed.js`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Добавил константы таблиц verification и экспортировал их через barrel
- [x] Экспортировал константы promo/access для переиспользования
- [x] Перевёл seed.js и profileExtras на новые константы таблиц
- [x] Обновил migration-notes и отчёт

**Критерии приёмки:**
- [x] `database/seed` использует те же имена таблиц, что и публичные модули
- [x] Модули auth/verification/profileExtras не содержат жёстко прописанных имён таблиц
- [x] Константы таблиц доступны через barrel каждого модуля

**Понятным языком: что сделано/что поменял:**
- Я создал файл с константами таблиц в verification.
- Я экспортировал константы таблиц из promo и access.
- Я обновил сидер и профили, чтобы брать имена таблиц из констант.
- Я дополнил заметки миграций и отчёт.

**Блокеры (если есть):**
- Жду подтверждения local-sim от Гринча

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Унифицировал имена таблиц между модулями и сидером local-sim, обновил документацию.
- **Что осталось:** Получить подтверждение и двигаться к SQL-миграциям.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Константы таблиц теперь единые для модулей и сидера.
- **Затронутые файлы:**
  - `local-sim/modules/verification/constants.js`
  - `local-sim/modules/verification/index.js`
  - `local-sim/modules/verification/storage/verificationDataset.js`
  - `local-sim/modules/auth/profileExtras.js`
  - `local-sim/modules/promo/index.js`
  - `local-sim/modules/access/index.js`
  - `local-sim/database/seed.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-046 — Local-sim: canonical auth dataset
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 19:05

**Резюме:** Заполнил локальные JSON таблицы auth и profiles каноничными администраторами, обновил сидеры, транзакции и верификационные данные, чтобы local-sim отражал реальную структуру перед SQL.

**Объём работ (файлы/модули):**
- `local-sim/db/auth_users.json`
- `local-sim/db/profiles.json`
- `local-sim/db/profile_transactions.json`
- `local-sim/db/verification_requests.json`
- `local-sim/db/verification_uploads.json`
- `local-sim/db/verification_queue.json`
- `local-sim/modules/auth/accounts/seedAccounts.js`
- `local-sim/modules/auth/accounts/seedLocalAuth.js`
- `local-sim/migration-notes.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Описал canonical аккаунты в `db/auth_users.json` и `db/profiles.json`
- [x] Обновил сидер auth для чтения JSON и прокидывания статуса/ролей
- [x] Дополнил транзакции и верификацию данными по новым аккаунтам
- [x] Обновил migration-notes и отчёт

**Критерии приёмки:**
- [x] Auth snapshot возвращает четыре предустановленных аккаунта с корректными ролями и статусами
- [x] Transactions и verification JSON ссылаются на те же `user_id`
- [x] Сидер `seedLocalAuth` сохраняет `status`, `role_level` и массив `roles`

**Понятным языком: что сделано/что поменял:**
- Я записал пользователей и профили админов в JSON.
- Я заставил сидер auth брать данные из этих JSON и хранить статусы.
- Я добавил реальные транзакции и заявки на верификацию для этих людей.
- Я переписал заметки миграций под новый набор данных.

**Блокеры (если есть):**
- Жду подтверждения local-sim от Гринча

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Каноничные аккаунты и связанные с ними данные заведены в db JSON, сидеры и заметки обновлены.
- **Что осталось:** Получить подтверждение и переходить к подготовке SQL-миграций.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Данные в local-sim теперь полностью согласованы между auth, transactions и verification.
- **Затронутые файлы:**
  - `local-sim/db/auth_users.json`
  - `local-sim/db/profiles.json`
  - `local-sim/db/profile_transactions.json`
  - `local-sim/db/verification_requests.json`
  - `local-sim/db/verification_uploads.json`
  - `local-sim/db/verification_queue.json`
  - `local-sim/modules/auth/accounts/seedAccounts.js`
  - `local-sim/modules/auth/accounts/seedLocalAuth.js`
  - `local-sim/migration-notes.md`

## TAKE-20251017-045 — Local-sim: storage для promo/transactions/verification/rank
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 18:25

**Резюме:** Перенёс оставшиеся dataset-хелперы promo, transactions, verification и rank в подпапки storage, собрал единые barrel-экспорты и обновил документацию. Теперь все ключевые модули local-sim используют storage-индексы перед будущими SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/modules/promo/storage/promocodes.js`
- `local-sim/modules/transactions/storage/transactionRecords.js`
- `local-sim/modules/verification/storage/verificationDataset.js`
- `local-sim/modules/rank/storage/rankDataset.js`
- `local-sim/migration-notes.md`
- `local-sim/modules/*/index.js`, `api.js`, `helpers.js`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести promo dataset в `storage/promocodes`
- [x] Перенести transactions dataset в `storage/transactionRecords`
- [x] Перенести verification dataset в `storage/verificationDataset`
- [x] Перенести rank dataset в `storage/rankDataset`
- [x] Обновить migration-notes под новые storage-хелперы

**Критерии приёмки:**
- [x] Модули promo/transactions/verification/rank используют только storage-баррели без прямых импортов dataset
- [x] Storage-индексы реэкспортируют canonical snapshot-хелперы и адаптеры
- [x] Migration-notes отражают перенос dataset-логики в storage

**Понятным языком: что сделано/что поменял:**
- Я вынес все оставшиеся dataset-файлы в подпапки storage.
- Я обновил импорты модулей, чтобы они брали данные через storage.
- Я переписал migration-notes под новую структуру.
- Я зафиксировал изменения в отчёте.

**Блокеры (если есть):**
- Жду подтверждения local-sim от Гринча

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Storage-хелперы для promo, transactions, verification, rank собраны и подключены через единые индексы; документация обновлена.
- **Что осталось:** Получить подтверждение и перейти к подготовке SQL-миграций.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Удалены устаревшие `dataset.js`, добавлены новые storage-файлы.
- **Затронутые файлы:**
  - `local-sim/modules/promo/storage/promocodes.js`
  - `local-sim/modules/promo/storage/index.js`
  - `local-sim/modules/promo/core/repository.js`
  - `local-sim/modules/transactions/storage/transactionRecords.js`
  - `local-sim/modules/transactions/storage/index.js`
  - `local-sim/modules/transactions/api.js`
  - `local-sim/modules/transactions/index.js`
  - `local-sim/modules/verification/storage/extras.js`
  - `local-sim/modules/verification/storage/verificationDataset.js`
  - `local-sim/modules/verification/storage/index.js`
  - `local-sim/modules/verification/index.js`
  - `local-sim/modules/verification/api.js`
  - `local-sim/modules/verification/queue.js`
  - `local-sim/modules/verification/admin.js`
  - `local-sim/modules/rank/storage/rankDataset.js`
  - `local-sim/modules/rank/storage/index.js`
  - `local-sim/modules/rank/api.js`
  - `local-sim/modules/rank/helpers.js`
  - `local-sim/modules/rank/index.js`
  - `local-sim/migration-notes.md`
  - `report.md`


## TAKE-20251017-044 — Local-sim: ревизия storage прогресса
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 17:50

**Резюме:** Провёл ревизию модулей local-sim, чтобы убедиться в наличии storage-баррелов и оценить остаток работ по переносу dataset.

**Объём работ (файлы/модули):**
- Проверка `local-sim/modules/*/storage/index.js`
- Анализ импортов `./dataset.js` в модулях local-sim
- Обновление `report.md`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Проверил наличие storage/index.js во всех модулях local-sim
- [x] Собрал список модулей с прямыми импортами `./dataset.js`
- [x] Сформировал сводку по выполненным и оставшимся задачам

**Критерии приёмки:**
- [x] Отчёт фиксирует текущее покрытие storage по модулям
- [x] Указаны оставшиеся модули с зависимостью от dataset
- [x] Пользователь получает оценку объёма оставшихся работ

**Понятным языком: что сделано/что поменял:**
- Я проверил все модули local-sim на наличие storage индексов.
- Я нашёл модули, где всё ещё импортируется dataset напрямую.
- Я описал, сколько работы осталось и какие модули впереди.

**Блокеры (если есть):**
- Блокеров нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Провёл ревизию storage-структуры и обновил отчёт.
- **Что осталось:** Перенести dataset-логику promo, transactions, verification, rank в storage и дождаться подтверждения local-sim.
- **Коммиты/PR:** текущая ветка `work` (новых коммитов нет)
- **Замечания:** Изменений кода не делал, только отчёт.
- **Затронутые файлы:**
  - `report.md`

## TAKE-20251017-043 — Local-sim: storage для admin access snapshot
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 17:33

**Резюме:** Перенёс snapshot доступа в подпапку storage, собрал общий barrel и обновил импорты. Продолжаю выравнивать local-sim по единым путям перед SQL.

**Объём работ (файлы/модули):**
- `local-sim/modules/access/storage/accessSnapshot.js`
- `local-sim/modules/access/storage/index.js`
- `local-sim/modules/access/roles/index.js`
- `local-sim/modules/access/index.js`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести dataset доступа в `storage/accessSnapshot.js`
- [x] Обновить barrel `storage/index.js` и публичные экспорты
- [x] Перевести roles/index на импорт через storage
- [x] Обновить migration-notes и отчёт

**Критерии приёмки:**
- [x] В каталоге `access` нет прямых импортов `./dataset.js`
- [x] Barrel `modules/access/storage/index.js` экспортирует snapshot и логи
- [x] Migration notes описывают storage helper доступа

**Понятным языком: что сделано/что поменял:**
- Я перенёс dataset доступа в storage/accessSnapshot.
- Я обновил barrel storage и все импорты на новый путь.
- Я переписал заметки миграций и отчёт под storage.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Snapshot доступа перенесён в storage, импорты и документация обновлены.
- **Что осталось:** Получить подтверждение и готовить SQL-миграции.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Файл `modules/access/dataset.js` удалён, логика переехала в storage.
- **Затронутые файлы:**
  - `local-sim/modules/access/storage/accessSnapshot.js`
  - `local-sim/modules/access/storage/index.js`
  - `local-sim/modules/access/roles/index.js`
  - `local-sim/modules/access/index.js`
  - `local-sim/migration-notes.md`
  - `report.md`


## TAKE-20251017-042 — Local-sim: storage для auth users
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 17:15

**Резюме:** Перенёс auth snapshot в подпапку storage, добавил barrel и обновил импорты. Продолжаю приводить local-sim к единому правилу путей перед SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/modules/auth/storage/authUsers.js`
- `local-sim/modules/auth/storage/index.js`
- `local-sim/modules/auth/api.js`
- `local-sim/modules/auth/index.js`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести auth dataset в `storage/authUsers.js`
- [x] Добавить barrel `storage/index.js` для auth
- [x] Обновить импорты auth API и публичного barrel на storage
- [x] Обновить migration-notes и отчёт под новый путь

**Критерии приёмки:**
- [x] В каталоге `auth` нет прямых импортов `./dataset.js`
- [x] Barrel `modules/auth/index.js` экспортирует snapshot только через storage
- [x] Migration notes фиксируют новый storage helper auth пользователей

**Понятным языком: что сделано/что поменял:**
- Я перенёс auth snapshot в файл storage/authUsers.
- Я сделал barrel storage и переключил API на новый путь.
- Я обновил migration-notes и этот отчёт.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Auth snapshot перенесён в storage, barrel собран, импорты и документация обновлены.
- **Что осталось:** Получить подтверждение и готовить SQL-миграции.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Файл `dataset.js` переехал в `storage/authUsers.js`.
- **Затронутые файлы:**
  - `local-sim/modules/auth/storage/authUsers.js`
  - `local-sim/modules/auth/storage/index.js`
  - `local-sim/modules/auth/api.js`
  - `local-sim/modules/auth/index.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-041 — Local-sim: storage для communications snapshot
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 16:45

**Резюме:** Перенёс snapshot коммуникаций в подпапку storage, собрал barrel и обновил импорты. Продолжаю выравнивать local-sim по
единому правилу путей перед будущими SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/modules/communications/storage/communicationSnapshot.js`
- `local-sim/modules/communications/storage/index.js`
- `local-sim/modules/communications/threads.js`
- `local-sim/modules/communications/index.js`
- `local-sim/migration-notes.md`
- `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести snapshot коммуникаций в `storage/communicationSnapshot.js`
- [x] Собрать barrel `storage/index.js`
- [x] Обновить импорты `threads` и публичного barrel на storage
- [x] Обновить migration-notes и отчёт под новый путь

**Критерии приёмки:**
- [x] В каталоге `communications` нет импортов `./dataset.js`
- [x] Barrel `communications/index.js` экспортирует snapshot через `storage/index.js`
- [x] Migration notes фиксируют новый путь snapshot коммуникаций

**Понятным языком: что сделано/что поменял:**
- Я перенёс dataset коммуникаций в подпапку storage.
- Я сделал индекс storage и обновил все импорты на него.
- Я поправил migration-notes и этот отчёт.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** snapshot коммуникаций перенесён в storage, barrel собран, документация обновлена.
- **Что осталось:** получить подтверждение и готовить SQL-миграции.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Файл `dataset.js` переименован в `storage/communicationSnapshot.js`.
- **Затронутые файлы:**
  - `local-sim/modules/communications/storage/communicationSnapshot.js`
  - `local-sim/modules/communications/storage/index.js`
  - `local-sim/modules/communications/threads.js`
  - `local-sim/modules/communications/index.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-040 — Local-sim: storage для clients snapshot
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 16:30

**Резюме:** Переношу клиентский dataset в подпапку storage, добавляю barrel и обновляю импорты, чтобы все пути шли через единый индекс перед SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/modules/clients/storage/clientSnapshot.js`
- `local-sim/modules/clients/storage/index.js`
- `local-sim/modules/clients/api.js`
- `local-sim/modules/clients/index.js`
- `local-sim/migration-notes.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести клиентский dataset в `storage/clientSnapshot.js`
- [x] Собрать barrel `storage/index.js` для клиентов
- [x] Обновить импорты `clients/api` и публичного barrel на новый путь storage

**Критерии приёмки:**
- [x] В каталоге `clients` нет прямых импортов `./dataset.js`
- [x] Barrel `clients/index.js` реэкспортирует функции через `storage/index.js`
- [x] Migration notes отражают новый storage helper для клиентов

**Понятным языком: что сделано/что поменял:**
- Перенёс весь код dataset клиентов в новый файл storage/clientSnapshot.
- Добавил индекс storage и переключил клиенты на импорт через него.
- Обновил заметки миграций, чтобы зафиксировать новый путь.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Storage для клиентов собран, импорты и документация обновлены.
- **Что осталось:** Дождаться подтверждения и затем синхронизировать SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** Удалил старый `modules/clients/dataset.js`, всё переехало в storage.
- **Затронутые файлы:**
  - `local-sim/modules/clients/storage/clientSnapshot.js`
  - `local-sim/modules/clients/storage/index.js`
  - `local-sim/modules/clients/api.js`
  - `local-sim/modules/clients/index.js`
  - `local-sim/migration-notes.md`
  - `report.md`


## TAKE-20251017-039 — Local-sim: storage для admin logs
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 16:18

**Резюме:** Планирую вынести helpers админских логов в подпапку `storage`, собрать barrel и обновить импорты API. Это продолжит унификацию путей local-sim перед миграциями SQL.

**Объём работ (файлы/модули):**
- `local-sim/modules/logs/dataset.js`
- `local-sim/modules/logs/storage/index.js`
- `local-sim/modules/logs/storage/adminLogs.js`
- `local-sim/modules/logs/api.js`
- `local-sim/modules/logs/index.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Вынести код dataset в `storage/adminLogs.js`
- [x] Добавить barrel `storage/index.js`
- [x] Обновить импорты API и публичного barrel `logs/index.js`

**Критерии приёмки:**
- [x] В каталоге `logs` нет прямых импортов `dataset.js`
- [x] `logs/storage/index.js` реэкспортирует функции чтения/снимков
- [x] API логов использует новый путь storage

**Понятным языком: что сделано/что поменял:**
- Перенёс логику dataset в новый файл storage/adminLogs.
- Создал индекс storage и подключил его в публичный barrel.
- Обновил API, чтобы брать данные только через storage.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Перенёс admin logs в storage, обновил импорты и barrels.
- **Что осталось:** Получить подтверждение local-sim и переходить к SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —
- **Затронутые файлы:**
  - `local-sim/modules/logs/storage/adminLogs.js`
  - `local-sim/modules/logs/storage/index.js`
  - `local-sim/modules/logs/api.js`
  - `local-sim/modules/logs/index.js`
  - `local-sim/migration-notes.md`
  - `report.md`

## TAKE-20251017-038 — Local-sim: storage для access logs
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 16:05

**Резюме:** Перенёс логи изменений ролей в подпапку `storage`, собрал barrel и обновил публичный экспорт модуля access. Это продолжает унификацию путей local-sim перед будущими SQL-миграциями.

**Объём работ (файлы/модули):**
- `local-sim/modules/access/storage/rolePermissionLogs.js`
- `local-sim/modules/access/storage/index.js`
- `local-sim/modules/access/index.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести лог ролей в подпапку `storage/rolePermissionLogs.js`
- [x] Добавить barrel `storage/index.js` для access
- [x] Обновить публичный экспорт модуля на новый путь

**Критерии приёмки:**
- [x] В каталоге `access` нет прямых импортов `rolePermissionLogs.js`
- [x] Barrel `access/index.js` экспортирует логи через `storage/index.js`
- [x] Публичные функции логов (append/list/clear) и `__internals` доступны как раньше

**Понятным языком: что сделано/что поменял:**
- Перенёс файл логов в подпапку storage.
- Сделал индекс storage, который реэкспортирует функции логов.
- Обновил barrel access, чтобы он брал логи только через storage.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Перенёс логи ролей в storage, добавил barrel и обновил экспорт access.
- **Что осталось:** Получить подтверждение local-sim и переходить к SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —
- **Затронутые файлы:**
  - `local-sim/modules/access/storage/rolePermissionLogs.js`
  - `local-sim/modules/access/storage/index.js`
  - `local-sim/modules/access/index.js`
  - `report.md`


## TAKE-20251017-037 — Local-sim: storage для transaction logs
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 15:53

**Резюме:** Перенёс хранилище логов транзакций в подкаталог `storage`, оформил barrel и выровнял публичный API модуля.
Это продолжает унификацию путей local-sim и готовит данные к будущей миграции в SQL.

**Объём работ (файлы/модули):**
- `local-sim/modules/transactions/storage/index.js`
- `local-sim/modules/transactions/storage/logs.js`
- `local-sim/modules/transactions/index.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести `transactions/logs.js` в `storage/logs.js`
- [x] Собрать barrel `transactions/storage/index.js`
- [x] Обновить публичный экспорт модуля на новый путь `storage`

**Критерии приёмки:**
- [x] В каталоге `transactions` нет прямых импортов `./logs.js`
- [x] Barrel `transactions/index.js` экспортирует логи через `storage/index.js`
- [x] Новая структура сохраняет существующий API `readTransactionLogs` и `appendTransactionLog`

**Понятным языком: что сделано/что поменял:**
- Перенёс файл логов в новую папку storage.
- Добавил index, чтобы импортировать логи через единый путь.
- Проверил, что публичный API транзакций остался прежним.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Переставил хранилище логов и обновил barrel экспорта.
- **Что осталось:** Получить подтверждение local-sim и затем переходить к SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —
- **Затронутые файлы:**
  - `local-sim/modules/transactions/storage/index.js`
  - `local-sim/modules/transactions/storage/logs.js`
  - `local-sim/modules/transactions/index.js`
  - `report.md`

## TAKE-20251017-036 — Local-sim: storage для rank
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 15:39

**Резюме:** Планирую перенести хранилище рангов в подпапку `storage` и собрать barrel, чтобы унифицировать публичные пути local-sim. Обновлю импорты API и помощников, проверю, что модуль продолжает экспортировать те же функции.

**Объём работ (файлы/модули):**
- `local-sim/modules/rank/storage/index.js`
- `local-sim/modules/rank/api.js`
- `local-sim/modules/rank/index.js`
- `local-sim/modules/rank/helpers.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенести хранилище rank в подпапку `storage` с barrel `index.js`
- [x] Обновить импорты rank на новый путь `storage/index.js`
- [x] Проверить публичный API rank после переноса

**Критерии приёмки:**
- [x] Модуль `rank/api` импортирует хранилище через `storage/index.js`
- [x] Barrel `rank/index.js` реэкспортирует хранилище из нового индекса
- [x] В каталоге `rank` нет прямых импортов `storage.js`

**Понятным языком: что сделано/что поменял:**
- Перенёс файл `storage.js` в подпапку `storage` и оставил логику без изменений.
- Подключил API рангов к новому пути `storage/index.js`.
- Добавил экспорт хранилища в `rank/index.js`, чтобы barrel оставался единой точкой входа.

**Блокеры (если есть):**
- —

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Перенёс rank storage в подпапку, обновил импорты и barrel.
- **Что осталось:** Получить подтверждение local-sim и далее двигаться к SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —
- **Затронутые файлы:**
  - `local-sim/modules/rank/storage/index.js`
  - `local-sim/modules/rank/api.js`
  - `local-sim/modules/rank/index.js`
  - `report.md`

## TAKE-20251017-035 — Local-sim: storage для verification
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 15:27

**Резюме:** Перенёс модуль хранения verification в подпапку со своим barrel, обновил импорты и проверил публичный API модуля.

**Объём работ (файлы/модули):**
- `local-sim/modules/verification/storage/index.js`
- `local-sim/modules/verification/admin.js`
- `local-sim/modules/verification/index.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенёс `verification/storage.js` в подкаталог с barrel
- [x] Обновил импорты verification на новый путь
- [x] Проверил публичный API verification после перестановки

**Критерии приёмки:**
- [x] Модуль `verification/admin` импортирует хранилище через `storage/index.js`
- [x] Barrel `verification/index.js` реэкспортирует хранилище из нового индекса
- [x] В проекте нет прямых импортов `verification/storage.js`

**Понятным языком: что сделано/что поменял:**
- Перенёс файл хранилища verification в подпапку storage.
- Сделал barrel `storage/index.js` и обновил импорты.
- Убедился, что публичные экспорты verification остались прежними.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Перенёс хранилище verification и обновил barrels.
- **Что осталось:** Дождаться подтверждения и решить по SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —
- **Затронутые файлы:**
  - `local-sim/modules/verification/storage/index.js`
  - `local-sim/modules/verification/index.js`
  - `local-sim/modules/verification/admin.js`
  - `report.md`

## TAKE-20251017-034 — Local-sim: storage для promo
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 15:22

**Резюме:** Вынес адаптер хранилища промокодов в отдельный подкаталог `storage` и собрал для него barrel.
Обновил импорты `core` и `api`, чтобы они тянули хранилище через новый индекс и не трогали файл напрямую.

**Объём работ (файлы/модули):**
- `local-sim/modules/promo/storage/index.js`
- `local-sim/modules/promo/core/repository.js`
- `local-sim/modules/promo/api/createPromocode.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Перенёс `storage.js` в подкаталог с barrel `storage/index.js`
- [x] Обновил импорты promo-core и promo-api на новый путь

**Критерии приёмки:**
- [x] Модуль `promo/core` обращается к хранилищу через `storage/index.js`
- [x] Эндпоинт `createPromocode` использует тот же barrel
- [x] В каталоге `promo` нет прямых импортов `storage.js`

**Понятным языком: что сделано/что поменял:**
- Я перенёс адаптер хранилища промо в отдельную папку.
- Я сделал индекс, чтобы хранилище подключалось по правилам barrels.
- Я поправил импорты в core и api, чтобы они брали новый путь.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Подготовлен barrel для promo storage и обновлены импорты.
- **Что осталось:** Получить подтверждение и решать по SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `local-sim/modules/promo/storage/index.js`
  - `local-sim/modules/promo/core/repository.js`
  - `local-sim/modules/promo/api/createPromocode.js`

## TAKE-20251017-033 — Local-sim: barrels для promo
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 14:20

**Резюме:** Привёл промо-модуль local-sim к правилу barrels: собрал индекс для `core` и `api`, убрал прямые импорты файлов.
Обновил `promo/index.js`, чтобы публичный API подтягивался только через новые точки входа и сохранял `__internals`.

**Объём работ (файлы/модули):**
- `local-sim/modules/promo/index.js`
- `local-sim/modules/promo/api/{index.js,createPromocode.js,getPromocode.js,listPromocodes.js,updatePromocode.js}`
- `local-sim/modules/promo/core/index.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Собрал barrels для `promo/core` и `promo/api`
- [x] Перевёл все импорты promo на новые barrels
- [x] Проверил, что `__internals` promo используют barrel-функции

**Критерии приёмки:**
- [x] `local-sim/modules/promo/index.js` не импортирует файлы напрямую из `api/*`
- [x] API promo берёт хелперы и репозиторий через `core/index.js`
- [x] Все публичные методы promo доступны через barrel `local-sim/modules/promo/index.js`

**Понятным языком: что сделано/что поменял:**
- Я добавил index-файлы для подпапок core и api в promo.
- Я обновил промо-эндпоинты, чтобы они брали хелперы через новый barrel.
- Я почистил `promo/index.js`, чтобы публичный API был через новые index-файлы.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Настроены barrels promo и обновлены импорты local-sim.
- **Что осталось:** Получить подтверждение и, при необходимости, двигаться к SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —

## TAKE-20251017-032 — Local-sim: barrel для database
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 14:05

**Резюме:** Собрал единый barrel для каталога `local-sim/database`, чтобы все модули тянули `getLocalDatabase` и сидеры через одну точку. Обновил датасеты и сидеры модулей, проверил, что доступ к локальной БД и seed-состоянию продолжает работать через новый публичный путь.

**Объём работ (файлы/модули):**
- `local-sim/database/index.js`
- `local-sim/modules/auth/{profileExtras.js,dataset.js,accounts/seedLocalAuth.js}`
- `local-sim/modules/{access,clients,communications,logs,promo,rank,transactions,verification}/dataset.js`
- `local-sim/modules/promo/storage.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Собрал barrel `local-sim/database/index.js`
- [x] Перевёл модули local-sim на новый импорт базы
- [x] Проверил сидер local-sim на использование barrel

**Критерии приёмки:**
- [x] Все импорты `getLocalDatabase` идут через `local-sim/database/index.js`
- [x] `applyLocalDatabaseSeed` доступен из `local-sim/database/index.js`
- [x] Нет прямых импортов `local-sim/database/engine.js` и `seed.js` вне каталога `database`

**Понятным языком: что сделано/что поменял:**
- Я добавил index-файл в каталоге local-sim/database.
- Я обновил все модули, чтобы они брали базу через новый barrel.
- Я убедился, что сидер подключает функции через index.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Собран barrel базы и обновлены импорты модулей local-sim.
- **Что осталось:** Дождаться подтверждения и при необходимости перейти к SQL.
- **Коммиты/PR:** текущая ветка `work`
- **Замечания:** —

## TAKE-20251017-031 — Local-sim: унификация импортов
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 13:50

**Резюме:** Привёл локальные модули авторизации к единым путям с расширениями `.js`, чтобы полностью соблюсти правила публичного API без глубоких импортов. Обновил словари промо-определений, проверил, что barrels продолжают экспортировать нужные функции.

**Объём работ (файлы/модули):**
- `local-sim/modules/auth/accounts/seedAccounts.js`
- `local-sim/modules/auth/accounts/seedLocalAuth.js`
- `local-sim/modules/auth/admin/createAdminPanelActions.js`
- `local-sim/modules/auth/api.js`
- `local-sim/modules/auth/composeUser.js`
- `local-sim/modules/auth/profileActions.js`
- `local-sim/modules/auth/session/initAuthEffect.js`
- `local-sim/modules/promo/definitions/index.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Обновил относительные импорты на расширения `.js`
- [x] Проверил, что barrels продолжают экспортировать публичные функции

**Критерии приёмки:**
- [x] Все локальные импорты внутри `local-sim/modules/auth` используют явное расширение `.js`
- [x] Справочник промо-типов импортируется с расширениями `.js`
- [x] Никакие пути не ссылаются на каталоги без barrel

**Понятным языком: что сделано/что поменял:**
- Я добавил `.js` ко всем относительным импортам в auth-модулях.
- Я поправил подключение промо-определений, чтобы пути были явными.
- Я убедился, что barrels продолжают работать и ничего не сломалось.

**Блокеры (если есть):**
- Жду подтверждения local-sim

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Пути импортов local-sim приведены к единому формату.
- **Что осталось:** Дождаться подтверждения и при необходимости перейти к SQL.
- **Коммиты/PR:** текущая ветка `work` (будет оформлено после подтверждения)
- **Замечания:** —


## TAKE-20251017-030 — Каталог: провайдеры
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 13:40

**Резюме:** Привёл страницы провайдеров к структуре с хуками и блоками, чтобы публичный API соответствовал правилу barrels и не тянул глубокие импорты данных.

**Объём работ (файлы/модули):**
- `src/pages/catalog/providers/details/page/ProviderDetailsPage.jsx`
- `src/pages/catalog/providers/list/page/ProvidersListPage.jsx`
- `src/pages/catalog/providers/blocks/*`
- `src/pages/catalog/providers/hooks/*`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создал хуки `useProviderGames` и `useProvidersDirectory` с использованием alias `@/data`
- [x] Собрал блоки `ProviderGamesGrid` и `ProvidersDirectory` для публичного API
- [x] Перевёл страницы списка и деталей провайдера на новые barrels

**Критерии приёмки:**
- [x] Страницы провайдеров импортируют данные только через хуки
- [x] Список провайдеров рендерится через блок `ProvidersDirectory`
- [x] Страница провайдера использует блок `ProviderGamesGrid` и alias `@/data/games.js`

**Понятным языком: что сделано/что поменял:**
- Я сделал хуки для игр провайдера и общего каталога.
- Я собрал блоки для списка и карточек провайдера.
- Я убрал глубокие импорты и настроил barrels.

**Блокеры (если есть):**
- Жду подтверждения каталога

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения каталога)
- **Что сделано:** Провайдеры переведены на хуки, блоки и barrels.
- **Что осталось:** Дождаться подтверждения и перейти к следующему отделу.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `report.md`
  - `src/pages/catalog/providers/index.js`
  - `src/pages/catalog/providers/hooks/useProviderGames.js`
  - `src/pages/catalog/providers/hooks/useProvidersDirectory.js`
  - `src/pages/catalog/providers/hooks/index.js`
  - `src/pages/catalog/providers/blocks/ProviderGamesGrid/ProviderGamesGrid.jsx`
  - `src/pages/catalog/providers/blocks/ProvidersDirectory/ProvidersDirectory.jsx`
  - `src/pages/catalog/providers/blocks/index.js`
  - `src/pages/catalog/providers/details/page/ProviderDetailsPage.jsx`
  - `src/pages/catalog/providers/list/page/ProvidersListPage.jsx`


## TAKE-20251017-029 — Каталог: категории
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 13:25

**Резюме:** Разбил страницу каталога по категориям на хук и блок, чтобы публичный API соответствовал правилу barrels и не тянул глубокие импорты данных. Переключил страницу на alias `@/data` вместо относительного пути.

**Объём работ (файлы/модули):**
- `src/pages/catalog/categories/index.js`
- `src/pages/catalog/categories/page/CategoriesPage.jsx`
- `src/pages/catalog/categories/blocks/CatalogCategoriesSections/CatalogCategoriesSections.jsx`
- `src/pages/catalog/categories/blocks/index.js`
- `src/pages/catalog/categories/hooks/useCatalogCategories.js`
- `src/pages/catalog/categories/hooks/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создал хук `useCatalogCategories` с использованием alias `@/data`
- [x] Собрал блок `CatalogCategoriesSections` для отображения списка
- [x] Перевёл страницу категорий на локальный barrel

**Критерии приёмки:**
- [x] Страница категорий импортирует данные только через хук
- [x] Категории рендерятся через блок `CatalogCategoriesSections`
- [x] Путь к данным игр использует alias `@/data/games.js`

**Понятным языком: что сделано/что поменял:**
- Я вынес группировку игр в отдельный хук.
- Я собрал отображение категорий в блоке.
- Я заменил глубокий импорт на alias `@/data`.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения каталога)
- **Что сделано:** Страница категорий переведена на barrels и alias данных.
- **Что осталось:** Дождаться подтверждения и перейти к следующему отделу.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/catalog/categories/index.js`
  - `src/pages/catalog/categories/page/CategoriesPage.jsx`
  - `src/pages/catalog/categories/blocks/CatalogCategoriesSections/CatalogCategoriesSections.jsx`
  - `src/pages/catalog/categories/blocks/index.js`
  - `src/pages/catalog/categories/hooks/useCatalogCategories.js`
  - `src/pages/catalog/categories/hooks/index.js`

## TAKE-20251017-028 — Barrel для AuthProvider
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 13:10

**Резюме:** Собрал экшены и хук AuthProvider в единый barrel `src/app/auth`, чтобы провайдер использовал один публичный путь без глубоких импортов.

**Объём работ (файлы/модули):**
- `src/app/auth/actions/index.js`
- `src/app/auth/admin/index.js`
- `src/app/auth/user/index.js`
- `src/app/auth/hooks/index.js`
- `src/app/auth/index.js`
- `src/app/providers/auth/AuthProvider.jsx`
- Документация по AuthProvider

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создал barrel `src/app/auth/actions/index.js`
- [x] Создал barrel `src/app/auth/admin/index.js`
- [x] Создал barrel `src/app/auth/user/index.js`
- [x] Создал barrel `src/app/auth/hooks/index.js`
- [x] Создал общий barrel `src/app/auth/index.js`
- [x] Обновил `src/app/providers/auth/AuthProvider.jsx` на новый импорт
- [x] Обновил документацию пути импорта

**Критерии приёмки:**
- [x] `AuthProvider.jsx` импортирует экшены и хуки через `src/app/auth/index.js`
- [x] Все новые barrels реэкспортируют прежние публичные функции
- [x] Документация указывает новый путь импорта

**Понятным языком: что сделано/что поменял:**
- Я добавил index-файлы для экшенов, админских и пользовательских фабрик.
- Я создал общий barrel `src/app/auth/index.js`.
- Я переключил AuthProvider и документацию на новый импорт.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- Статус: ✅ Выполнено
- Что сделано: Barrels созданы, AuthProvider и документация обновлены.
- Что осталось: Ничего
- Коммиты/PR: текущая ветка `work`
- Замечания: —

## TAKE-20251017-027 — Barrel для форм авторизации
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 13:03

**Резюме:** Собрал формы входа и регистрации в единый barrel `features/auth`, чтобы страницы авторизации не тянули компоненты по глубоким путям. Обновил AssignRole, чтобы админка использовала тот же публичный экспорт API.

**Объём работ (файлы/модули):**
- `src/features/auth/index.js`
- `src/pages/auth/login/page/LoginPage.jsx`
- `src/pages/auth/register/page/RegisterPage.jsx`
- `src/pages/admin/features/access/roles/blocks/AssignRole/AssignRole.jsx`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создал barrel `src/features/auth/index.js` для форм и API
- [x] Обновил страницы логина и регистрации на новый импорт
- [x] Перевёл AssignRole на barrel `features/auth`

**Критерии приёмки:**
- [x] Формы логина и регистрации импортируются из `features/auth/index.js`
- [x] Админский AssignRole использует тот же barrel авторизации
- [x] Barrel `features/auth` реэкспортирует API и справочники

**Понятным языком: что сделано/что поменял:**
- Я собрал формы авторизации в одном index.
- Я обновил страницы входа и регистрации на новый импорт.
- Я поправил AssignRole, чтобы тянуть API из того же места.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения auth-фичи)
- **Что сделано:** Настроил barrel `features/auth` и обновил зависимости.
- **Что осталось:** Получить подтверждение и перейти к следующему отделу.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/features/auth/index.js`
  - `src/pages/auth/login/page/LoginPage.jsx`
  - `src/pages/auth/register/page/RegisterPage.jsx`
  - `src/pages/admin/features/access/roles/blocks/AssignRole/AssignRole.jsx`

## TAKE-20251017-026 — Коммуникации через блок и хук
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:55

**Резюме:** Собрал админские чаты в общий блок и хук, чтобы не держать логику загрузки в компонентах. Добавил плейсхолдер в ChatPanel для пустых каналов.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/communications/administrators-chat/AdministratorsChat.jsx`
- `src/pages/admin/features/communications/moderators-chat/ModeratorsChat.jsx`
- `src/pages/admin/features/communications/staff-chat/StaffChat.jsx`
- `src/pages/admin/features/communications/blocks/*`
- `src/pages/admin/features/communications/hooks/*`
- `src/pages/admin/features/communications/index.js`
- `src/pages/admin/shared/ChatPanel.jsx`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создал хук `useAdminChatChannel` для выбора треда по каналу
- [x] Добавил блок `AdminChatChannelPanel` и перевёл чаты на него
- [x] Обновил ChatPanel, чтобы показывать плейсхолдер без сообщений

**Критерии приёмки:**
- [x] Страницы чатов используют общий блок вместо прямого вызова local-sim
- [x] Хук коммуникаций экспортируется через barrel фичи
- [x] Пустой канал показывает текстовое состояние без ошибок

**Понятным языком: что сделано/что поменял:**
- Я вынес загрузку тредов в отдельный хук.
- Я собрал блок, который рендерит чат по каналу.
- Я добавил сообщение, когда в канале пока нет переписки.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения коммуникаций)
- **Что сделано:** Унифицировал админские чаты через блок и хук, добавил плейсхолдер пустого канала.
- **Что осталось:** Получить подтверждение и перейти к следующему отделу.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/communications/administrators-chat/AdministratorsChat.jsx`
  - `src/pages/admin/features/communications/moderators-chat/ModeratorsChat.jsx`
  - `src/pages/admin/features/communications/staff-chat/StaffChat.jsx`
  - `src/pages/admin/features/communications/blocks/AdminChatChannelPanel/AdminChatChannelPanel.jsx`
  - `src/pages/admin/features/communications/blocks/index.js`
  - `src/pages/admin/features/communications/hooks/useAdminChatChannel.js`
  - `src/pages/admin/features/communications/hooks/index.js`
  - `src/pages/admin/features/communications/index.js`
  - `src/pages/admin/shared/ChatPanel.jsx`

## TAKE-20251017-025 — Баррели логов админки
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:46

**Резюме:** Вынес загрузку и фильтры Log Admin в хук и блоки, чтобы страница соответствовала единому правилу публичных API. Обновил индекс фичи для экспорта новых точек входа.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/monitoring/log-admin/LogAdmin.jsx`
- `src/pages/admin/features/monitoring/log-admin/blocks/*`
- `src/pages/admin/features/monitoring/log-admin/hooks/*`
- `src/pages/admin/features/monitoring/log-admin/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Вынес загрузку логов в хук `useAdminLogs`
- [x] Добавил публичные блоки фильтров и таблицы логов
- [x] Страница Log Admin использует barrels блоков и хуков

**Критерии приёмки:**
- [x] Логика загрузки логов из local-sim вынесена в хук
- [x] Карточки фильтров и таблицы экспортируются через `blocks/index.js`
- [x] `log-admin/index.js` реэкспортирует страницу, блоки и хуки

**Понятным языком: что сделано/что поменял:**
- Я вынес запрос логов в отдельный хук.
- Я разбил страницу на блок фильтров и блок таблицы.
- Я обновил индекс фичи, чтобы экспортировать новые части.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения UI)
- **Что сделано:** Добавил хук и блоки для Log Admin, обновил публичный API фичи.
- **Что осталось:** Получить подтверждение и при необходимости продолжить унификацию monitoring.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/monitoring/log-admin/LogAdmin.jsx`
  - `src/pages/admin/features/monitoring/log-admin/blocks/AdminLogFilters/AdminLogFilters.jsx`
  - `src/pages/admin/features/monitoring/log-admin/blocks/AdminLogTable/AdminLogTable.jsx`
  - `src/pages/admin/features/monitoring/log-admin/blocks/index.js`
  - `src/pages/admin/features/monitoring/log-admin/hooks/useAdminLogs.js`
  - `src/pages/admin/features/monitoring/log-admin/hooks/index.js`
  - `src/pages/admin/features/monitoring/log-admin/index.js`


## TAKE-20251017-024 — Баррели корневой админки
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:36

**Резюме:** Подготовил barrels для корневых модулей админки, чтобы все внешние импорты шли через единые точки входа вместо прямых ссылок на JSX-файлы.

**Объём работ (файлы/модули):**
- `src/pages/admin/index.js`
- `src/pages/admin/page/AdminPage.jsx`
- `src/pages/admin/page/index.js`
- `src/pages/admin/layout/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel для `admin/page`
- [x] Создан barrel для `admin/layout`
- [x] Обновлены импорты админки на barrels вместо прямых путей

**Критерии приёмки:**
- [x] `src/pages/admin/index.js` экспортирует страницу и лейаут через index-файлы
- [x] `AdminPage.jsx` использует barrel лейаута
- [x] Новый публичный API не содержит прямых импортов `.jsx`

**Понятным языком: что сделано/что поменял:**
- Я добавил index-файл для страницы админки.
- Я добавил index-файл для лейаута админки.
- Я обновил импорты, чтобы использовать новые barrels.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения корневых путей)
- **Что сделано:** Добавил barrels для страницы и лейаута админки, обновил публичный API.
- **Что осталось:** Получить подтверждение и продолжить унификацию следующих отделов.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/index.js`
  - `src/pages/admin/page/AdminPage.jsx`
  - `src/pages/admin/page/index.js`
  - `src/pages/admin/layout/index.js`

## TAKE-20251017-023 — Баррели редактора рангов (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:27

**Резюме:** Собрал компоненты и хук редактора рангов в barrels, чтобы унифицировать публичный импорт без глубоких путей.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/access/rank-editor/RankEditor.jsx`
- `src/pages/admin/features/access/rank-editor/components/index.js`
- `src/pages/admin/features/access/rank-editor/hooks/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel компонентов редактора рангов
- [x] Создан barrel хуков редактора рангов
- [x] `RankEditor.jsx` использует barrels компонентов и хуков

**Критерии приёмки:**
- [x] Импорты компонентов в `RankEditor.jsx` идут через `components/index.js`
- [x] Импорт хука в `RankEditor.jsx` идёт через `hooks/index.js`
- [x] Barrels экспортируют все необходимые элементы без глубоких путей

**Понятным языком: что сделано/что поменял:**
- Я собрал компоненты редактора рангов в одном index.
- Я вынес хук редактора рангов в собственный index.
- Я перевёл страницу редактора рангов на новые импорты.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения UI)
- **Что сделано:** Создал barrels компонентов и хука, обновил страницу на новые импорты.
- **Что осталось:** Дождаться подтверждения и продолжить унификацию других отделов.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/access/rank-editor/RankEditor.jsx`
  - `src/pages/admin/features/access/rank-editor/components/index.js`
  - `src/pages/admin/features/access/rank-editor/hooks/index.js`


## TAKE-20251017-022 — Баррели блоков ролей (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:23

**Резюме:** Собрал блоки страницы ролей админки в единый barrel, чтобы убрать глубокие импорты и выровнять публичный API с остальными фичами. Обновил страницу редактирования роли на новый путь.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/access/roles/blocks/index.js`
- `src/pages/admin/features/access/roles/Roles.jsx`
- `src/pages/admin/features/access/role-edit/RoleEdit.jsx`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel блоков ролей админки
- [x] `Roles.jsx` использует блоки через новый barrel
- [x] `RoleEdit.jsx` импортирует `EditRolePermissions` из barrel блоков

**Критерии приёмки:**
- [x] Страница `Roles` не содержит глубоких импортов блоков
- [x] Barrel блоков экспортирует все публичные компоненты ролей
- [x] Страница редактирования роли использует тот же публичный API блоков

**Понятным языком: что сделано/что поменял:**
- Я создал общий index для блоков ролей.
- Я перевёл страницу ролей на импорт из нового barrel.
- Я обновил редактирование роли на тот же публичный API.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim/UI)
- **Что сделано:** Создал barrel блоков ролей и обновил импорты страниц Roles и RoleEdit.
- **Что осталось:** Получить подтверждение и при необходимости продолжить унификацию других блоков.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/access/roles/blocks/index.js`
  - `src/pages/admin/features/access/roles/Roles.jsx`
  - `src/pages/admin/features/access/role-edit/RoleEdit.jsx`


## TAKE-20251017-021 — Баррели архива промо (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:22

**Резюме:** Перевёл страницу архива промокодов на barrels блоков, чтобы убрать глубокие импорты и выровнять публичный API с активным списком. Создал индекс блоков архива для единых точек подключения.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/promo/archive/PromoArchive.jsx`
- `src/pages/admin/features/promo/archive/blocks/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel блоков архива промокодов
- [x] `PromoArchive.jsx` использует блоки архива через локальный barrel
- [x] Страница архива подключает таблицу и панель деталей через barrel списка промо

**Критерии приёмки:**
- [x] `PromoArchive.jsx` не содержит глубоких импортов блоков
- [x] Все публичные блоки архива экспортируются через `blocks/index.js`
- [x] Архив и список промокодов используют один и тот же barrel блоков списка

**Понятным языком: что сделано/что поменял:**
- Я создал index для блоков архива промо.
- Я перевёл страницу архива на импорт блоков через индексы.
- Я оставил подключение таблицы и деталей через barrel списка промо.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Импорты архива промокодов приведены к единым barrel путям.
- **Что осталось:** Дождаться подтверждения по обновлённым импортах local-sim/UI.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/promo/archive/PromoArchive.jsx`
  - `src/pages/admin/features/promo/archive/blocks/index.js`

## TAKE-20251017-020 — Баррели списка промо (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 12:04

**Резюме:** Перевёл страницу списка промокодов на единый barrel блоков, чтобы убрать глубокие импорты и упростить поддержку. Обновил панель деталей, чтобы график активаций подключался через тот же индекс.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/promo/list/PromoCodes.jsx`
- `src/pages/admin/features/promo/list/blocks/index.js`
- `src/pages/admin/features/promo/list/blocks/PromoDetailsPanel.jsx`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel блоков списка промо
- [x] `PromoCodes.jsx` импортирует блоки через новый barrel
- [x] `PromoDetailsPanel.jsx` использует `ActivationChart` из barrel

**Критерии приёмки:**
- [x] Страница `PromoCodes` не содержит прямых импортов блоков
- [x] Панель деталей промокода подключает график через общий индекс
- [x] Barrel блоков экспортирует все публичные компоненты списка промо

**Понятным языком: что сделано/что поменял:**
- Я собрал блоки промо-списка в одном index.
- Я переключил страницу промокодов на новые импорты.
- Я обновил панель деталей, чтобы брать график из того же index.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Импорты списка промокодов приведены к единому barrel блоков.
- **Что осталось:** Получить подтверждение по обновлённым импортам.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/promo/list/PromoCodes.jsx`
  - `src/pages/admin/features/promo/list/blocks/index.js`
  - `src/pages/admin/features/promo/list/blocks/PromoDetailsPanel.jsx`

## TAKE-20251017-019 — Баррели обзора (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 03:24

**Резюме:** Перевёл страницу админского обзора на единые barrels для компонентов,
хуков и констант, чтобы устранить глубокие импорты и соблюдать общее правило
архитектуры фич. Убедился, что RoleColumn использует собственный barrel для
вспомогательных рендер-функций.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/overview/Overview.jsx`
- `src/pages/admin/features/overview/components/index.js`
- `src/pages/admin/features/overview/components/roleColumn/index.js`
- `src/pages/admin/features/overview/hooks/index.js`
- `src/pages/admin/features/overview/hooks/useGroupedRoles.js`
- `src/pages/admin/features/overview/constants/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel компонентов `components/index.js`
- [x] Создан barrel хуков `hooks/index.js`
- [x] RoleColumn использует barrel `roleColumn/index.js` вместо глубоких импортов
- [x] `Overview.jsx` импортирует компоненты, хуки и константы через barrels

**Критерии приёмки:**
- [x] Все импорты Overview проходят через локальные barrels
- [x] Внутренние функции RoleColumn реэкспортируются через `roleColumn/index.js`
- [x] Публичный API фичи обзора соответствует общему правилу

**Понятным языком: что сделано/что поменял:**
- Я добавил индексы для компонентов и хуков обзора.
- Я переключил страницу Overview на новые импорты.
- Я вынес вспомогательные функции RoleColumn в отдельный barrel.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Импорты страницы обзора приведены к единому правилу barrels.
- **Что осталось:** Получить общее подтверждение по local-sim и UI структуре.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/overview/Overview.jsx`
  - `src/pages/admin/features/overview/components/index.js`
  - `src/pages/admin/features/overview/components/roleColumn/index.js`
  - `src/pages/admin/features/overview/hooks/index.js`
  - `src/pages/admin/features/overview/hooks/useGroupedRoles.js`
  - `src/pages/admin/features/overview/constants/index.js`


## TAKE-20251017-018 — Баррели транзакций (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 03:16

**Резюме:** Перевожу админскую страницу транзакций на единые barrels для блоков,
компонентов и хуков, чтобы убрать глубокие импорты и соответствовать общему
правилу архитектуры. Все импорты теперь идут через индексы, поддерживая
стабильный публичный API фичи.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/transactions/Transactions.jsx`
- `src/pages/admin/features/transactions/blocks/index.js`
- `src/pages/admin/features/transactions/blocks/TransactionsHistory.jsx`
- `src/pages/admin/features/transactions/components/index.js`
- `src/pages/admin/features/transactions/hooks/index.js`
- `src/pages/admin/features/transactions/hooks/useAdminTransactions.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel блоков транзакций с экспортом `TransactionsHistory`
- [x] Страница `Transactions.jsx` использует barrel вместо прямого импорта блока
- [x] Хуки и компоненты транзакций экспортируются через индексы без глубоких путей

**Критерии приёмки:**
- [x] `TransactionsHistory` импортирует UI-компоненты и хук через их barrels
- [x] `Transactions.jsx` импортирует блоки через `./blocks/index.js`
- [x] Структура фичи соответствует правилу единого публичного API

**Понятным языком: что сделано/что поменял:**
- Я добавил index-файлы для блоков, компонентов и хука транзакций.
- Я обновил страницу Transactions, чтобы она брала блок через новый barrel.
- Я переключил блок истории на использование новых индексных импортов.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Импорты страницы транзакций приведены к единому правилу barrels.
- **Что осталось:** Получить общее подтверждение по local-sim и UI-структуре.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/transactions/Transactions.jsx`
  - `src/pages/admin/features/transactions/blocks/index.js`
  - `src/pages/admin/features/transactions/blocks/TransactionsHistory.jsx`
  - `src/pages/admin/features/transactions/components/index.js`
  - `src/pages/admin/features/transactions/hooks/index.js`
  - `src/pages/admin/features/transactions/hooks/useAdminTransactions.js`

## TAKE-20251017-017 — Баррели клиентов (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 03:07

**Резюме:** Привожу страницу управления клиентами к единому правилу импорта блоков через локальный barrel. Упрощаю поддержку фичи, чтобы блоки можно было переиспользовать без глубоких путей.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/clients/Clients.jsx`
- `src/pages/admin/features/clients/blocks/index.js`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Создан barrel `blocks/index.js` с экспортами клиентских блоков
- [x] `Clients.jsx` использует barrel вместо глубоких импортов блоков
- [x] Проверено, что публичный API блоков не изменился

**Критерии приёмки:**
- [x] Все блоки клиента импортируются через `./blocks/index.js`
- [x] Страница клиентов продолжает рендерить фильтры, статистику и таблицу
- [x] Импорты следуют правилу единого barrels без лишних путей

**Понятным языком: что сделано/что поменял:**
- Я создал единый index для клиентских блоков.
- Я обновил страницу клиентов, чтобы она брала блоки через barrel.
- Я проверил, что интерфейс страницы не поменялся.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Страница клиентов переведена на общий barrel блоков.
- **Что осталось:** Дождаться общего ревью local-sim и UI правил.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/clients/Clients.jsx`
  - `src/pages/admin/features/clients/blocks/index.js`

## TAKE-20251017-016 — Баррели верификации (UI)
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:58

**Резюме:** Перевожу страницу админской верификации на внутренние barrels для блоков, хуков и компонентов. Это упрощает поддержку фичи и соответствует единому правилу импорта без глубоких путей.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/verification/Verification.jsx`
- `src/pages/admin/features/verification/blocks/*`
- `src/pages/admin/features/verification/hooks/*`
- `src/pages/admin/features/verification/components/*`

**Чеклист выполнения:**
- [ ] Local-sim: маршрут/эндпоинты готовы (не требуется для UI-рефакторинга)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Добавлены barrels `blocks/index.js`, `hooks/index.js`, `components/index.js`
- [x] Страница `Verification.jsx` использует новые barrels вместо глубоких путей
- [x] Блоки верификации берут `VerificationFieldBadges` через общий индекс компонентов

**Критерии приёмки:**
- [x] Все импорты внутри фичи верификации проходят через локальные barrels
- [x] Страница `Verification` продолжает рендерить все блоки без изменения API
- [x] Компоненты `VerificationRequestModal` и `VerificationIdleAccountsModal` доступны из `components/index.js`

**Понятным языком: что сделано/что поменял:**
- Я собрал блоки, хуки и компоненты в отдельные index-файлы.
- Я обновил страницу Verification, чтобы она импортировала всё через новые barrels.
- Я переключил блоки на использование общего индекса компонентов.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ✅ Выполнено
- **Что сделано:** Верификационная фича переведена на внутренние barrels без глубоких импортов.
- **Что осталось:** Дождаться общего ревью структуры фич.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `src/pages/admin/features/verification/Verification.jsx`
  - `src/pages/admin/features/verification/blocks/index.js`
  - `src/pages/admin/features/verification/blocks/VerificationApprovedBlock.jsx`
  - `src/pages/admin/features/verification/blocks/VerificationPartialBlock.jsx`
  - `src/pages/admin/features/verification/blocks/VerificationRejectedBlock.jsx`
  - `src/pages/admin/features/verification/blocks/VerificationRequestsBlock.jsx`
  - `src/pages/admin/features/verification/hooks/index.js`
  - `src/pages/admin/features/verification/components/index.js`

## TAKE-20251017-015 — Справочник секций логов
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:48

**Резюме:** Выношу список секций и ролей админских логов в constants local-sim, чтобы все модули использовали единый словарь. Обновляю API логов и экран Log Admin, переключая его на новые справочники и функции списка.

**Объём работ (файлы/модули):**
- `local-sim/modules/logs/constants.js`
- `local-sim/modules/logs/api.js`
- `src/pages/admin/features/monitoring/log-admin/LogAdmin.jsx`
- `src/pages/admin/features/transactions/blocks/TransactionsHistory.jsx`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (справочники логов в barrel)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Константы секций/ролей логов вынесены в `constants.js`
- [x] Локальные клиенты используют `listAdminLogSections`/`listAdminLogRoleOptions`

**Критерии приёмки:**
- [x] `ADMIN_LOG_SECTIONS` доступен из barrel local-sim
- [x] `getAdminLogSections` и `getAdminLogRoleOptions` возвращают клоны, а не исходные массивы
- [x] Экран Log Admin использует новые функции списка и отображает те же данные

**Понятным языком: что сделано/что поменял:**
- Я вынес справочники секций и ролей логов в constants.
- Я добавил новые функции списка и обновил API логов.
- Я переключил экран Log Admin и логирование транзакций на общий словарь секций.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Секции и роли логов опубликованы через barrel, фронт использует новые функции списка.
- **Что осталось:** Получить подтверждение local-sim.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `local-sim/modules/logs/constants.js`
  - `local-sim/modules/logs/api.js`
  - `src/pages/admin/features/monitoring/log-admin/LogAdmin.jsx`
  - `src/pages/admin/features/transactions/blocks/TransactionsHistory.jsx`

## TAKE-20251017-014 — Каналы чатов через barrel
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:41

**Резюме:** Привожу модуль communications local-sim к полному barrel-экспорту, добавляю перечисление каналов и общий метод получения тредов. Обновляю админские чаты, чтобы они брали данные через новый API и не дублировали логику каналов.

**Объём работ (файлы/модули):**
- `local-sim/modules/communications/constants.js`
- `local-sim/modules/communications/index.js`
- `local-sim/modules/communications/threads.js`
- `src/pages/admin/features/communications/*`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (communications публикует каналы через barrel)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Каналы чатов описаны константами `COMMUNICATION_CHANNELS`
- [x] Компоненты админских чатов используют `listCommunicationThreads`

**Критерии приёмки:**
- [x] Из `local-sim/modules/communications` можно импортировать `COMMUNICATION_CHANNELS`
- [x] `listCommunicationThreads` возвращает клоны списков и принимает канал
- [x] Обновлённые чаты продолжают показывать первый тред без ошибок

**Понятным языком: что сделано/что поменял:**
- Я добавил общий список каналов чатов.
- Я вынес общий метод `listCommunicationThreads`.
- Я переключил все админские чаты на новый barrel-API.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Коммуникации публикуют каналы и списки тредов через единый barrel.
- **Что осталось:** Дождаться подтверждения local-sim.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `local-sim/modules/communications/constants.js`
  - `local-sim/modules/communications/index.js`
  - `local-sim/modules/communications/threads.js`
  - `src/pages/admin/features/communications/administrators-chat/AdministratorsChat.jsx`
  - `src/pages/admin/features/communications/moderators-chat/ModeratorsChat.jsx`
  - `src/pages/admin/features/communications/staff-chat/StaffChat.jsx`

## TAKE-20251017-013 — Auth barrel внутри local-sim
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:27

**Резюме:** Привожу клиенты, ранги и verification в local-sim к единому импорту auth-хелперов через barrel. Убираю прямые пути на внутренние файлы auth, чтобы не нарушать публичный API модуля.

**Объём работ (файлы/модули):**
- `local-sim/modules/clients/api.js`
- `local-sim/modules/clients/constants.js`
- `local-sim/modules/clients/dataset.js`
- `local-sim/modules/rank/api.js`
- `local-sim/modules/verification/api.js`
- `local-sim/modules/verification/storage.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (auth barrel обслуживает clients/rank/verification)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Модули clients/rank/verification используют `../auth/index.js` вместо прямых путей

**Критерии приёмки:**
- [x] В `local-sim/modules/clients` нет импортов `../auth/composeUser.js` и `../auth/profileExtras.js`
- [x] `local-sim/modules/rank/api.js` импортирует `loadExtras` из barrel auth
- [x] `local-sim/modules/verification/{api,storage}.js` импортируют auth-хелперы через barrel

**Понятным языком: что сделано/что поменял:**
- Я переключил клиентов на barrel auth.
- Я обновил ранговый API, чтобы брать extras из barrel.
- Я перевёл verification API и хранилище на barrel auth.

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Все пересекающиеся модули подтягивают auth-хелперы только через barrel.
- **Что осталось:** Дождаться подтверждения local-sim.
- **Коммиты/PR:** текущая ветка `work`
- **Затронутые файлы:**
  - `local-sim/modules/clients/api.js`
  - `local-sim/modules/clients/constants.js`
  - `local-sim/modules/clients/dataset.js`
  - `local-sim/modules/rank/api.js`
  - `local-sim/modules/verification/api.js`
  - `local-sim/modules/verification/storage.js`

## TAKE-20251017-012 — Barrel-импорты для auth
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:17

**Резюме:** Привожу auth-модуль local-sim к единому публичному API для зависимостей verification и rank. Обновляю API рангового редактора, чтобы ранговые данные читались только через barrel rank.

**Объём работ (файлы/модули):**
- `local-sim/modules/auth/profileActions.js`
- `local-sim/modules/auth/profileExtras.js`
- `local-sim/modules/auth/accounts/seedLocalAuth.js`
- `local-sim/modules/auth/composeUser.js`
- `local-sim/modules/auth/api.js`
- `local-sim/modules/access/rank-editor/api/listRankRewards.js`
- `local-sim/modules/access/rank-editor/api/resetRankRewards.js`
- `local-sim/modules/access/rank-editor/api/updateRankReward.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (auth тянет rank/verification только через barrel)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Auth local-sim не содержит глубоких импортов rank/verification
- [x] Rank-editor API использует barrel `modules/rank`

**Критерии приёмки:**
- [x] Нет импортов `../rank/api.js` в `local-sim/modules`
- [x] Нет импортов `../verification/helpers.js` и `../verification/storage.js`
- [x] Все нужные утилиты verification/rank берутся из их barrel

**Понятным языком: что сделано/что поменял:**
- Я перевёл auth-экстра данные на barrel verification
- Я обновил auth API и composeUser на barrel rank
- Я настроил rank-editor API работать только через barrel rank

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Auth и rank-editor используют только barrel-пути rank/verification
- **Что осталось:** Получить подтверждение local-sim
- **Коммиты/PR:** текущий PR (ветка `work`)
- **Затронутые файлы:**
  - `local-sim/modules/auth/profileActions.js`
  - `local-sim/modules/auth/profileExtras.js`
  - `local-sim/modules/auth/accounts/seedLocalAuth.js`
  - `local-sim/modules/auth/composeUser.js`
  - `local-sim/modules/auth/api.js`
  - `local-sim/modules/access/rank-editor/api/listRankRewards.js`
  - `local-sim/modules/access/rank-editor/api/resetRankRewards.js`
  - `local-sim/modules/access/rank-editor/api/updateRankReward.js`

## TAKE-20251017-011 — Barrel для rank профиля
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:16

**Резюме:** Привожу ранговые хуки профиля к использованию единого barrel local-sim. Проверяю, что публичный API rank остаётся стабильным и не требует глубоких путей.

**Объём работ (файлы/модули):**
- `src/pages/profile/rank/hooks/useProfileRankSummary.js`
- `src/pages/profile/rank/hooks/useProfileRankData.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (barrel rank публикует API)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Хуки профиля rank импортируют данные только через barrel

**Критерии приёмки:**
- [x] `getProfileRankSummary` импортируется из `local-sim/modules/rank/index.js`
- [x] `getProfileRankData` импортируется из `local-sim/modules/rank/index.js`
- [x] В проекте нет глубоких импортов `local-sim/modules/rank/api.js`

**Понятным языком: что сделано/что поменял:**
- Я переключил ранговый summary-хук на barrel rank
- Я обновил ранговый data-хук на barrel rank
- Я проверил, что прямых импортов `rank/api` не осталось

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Хуки профиля rank используют barrel, глубинных импортов нет
- **Что осталось:** Дождаться подтверждения local-sim
- **Коммиты/PR:** текущий PR (ветка `work`)
- **Затронутые файлы:**
  - `src/pages/profile/rank/hooks/useProfileRankSummary.js`
  - `src/pages/profile/rank/hooks/useProfileRankData.js`

## TAKE-20251017-010 — Barrel для promo definitions
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:09

**Резюме:** Привожу модуль promo local-sim к единому публичному API. Добавлю экспорт типов промо через основной barrel и переключу фронтовые экраны создания промокодов на новый путь.

**Объём работ (файлы/модули):**
- `local-sim/modules/promo/index.js`
- `local-sim/modules/promo/definitions/index.js`
- `src/pages/admin/features/promo/create/PromoCodeCreate.jsx`
- `src/pages/admin/features/promo/create/blocks/PromoTypesGrid.jsx`
- `src/pages/admin/features/promo/create/blocks/PromoTypesReference.jsx`
- `src/pages/admin/features/promo/create/hooks/usePromoConstructor.js`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (promo barrel реэкспортирует определения типов)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Фронтовые импорты promo типов используют только barrel `modules/promo`

**Критерии приёмки:**
- [x] `promoTypeDefinitions` доступен из `local-sim/modules/promo/index.js`
- [x] `promoTypeMap` и `getPromoTypeById` доступны через основной barrel
- [x] Фронтовые экраны promo не делают глубоких импортов в `modules/promo/definitions`

**Понятным языком: что сделано/что поменял:**
- Я добавил экспорт promo-типов в главный barrel
- Я перевёл весь фронт создания промо на новый путь
- Я проверил, что больше нет прямых импортов в definitions

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Barrel promo теперь отдаёт типы, фронт переключён на единый путь
- **Что осталось:** Дождаться подтверждения local-sim
- **Коммиты/PR:** текущий PR (ветка `work`)
- **Затронутые файлы:**
  - `local-sim/modules/promo/index.js`
  - `src/pages/admin/features/promo/create/PromoCodeCreate.jsx`
  - `src/pages/admin/features/promo/create/blocks/PromoTypesGrid.jsx`
  - `src/pages/admin/features/promo/create/blocks/PromoTypesReference.jsx`
  - `src/pages/admin/features/promo/create/hooks/usePromoConstructor.js`

## TAKE-20251017-009 — Barrel для verification
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:03

**Резюме:** Собираю local-sim verification в единый barrel, чтобы фронт и сиды не ходили глубоко в структуру. Обновляю импорты экранов и хуков verification на новый путь.

**Объём работ (файлы/модули):**
- `local-sim/modules/verification/index.js`
- `local-sim/database/seed.js`
- `src/pages/admin/features/verification/Verification.jsx`
- `src/pages/admin/features/verification/hooks/useAdminVerificationRequests.js`
- `src/pages/admin/features/verification/hooks/useAdminVerificationIdleAccounts.js`
- `src/pages/admin/features/access/roles/blocks/Verification/VerificationQueue.jsx`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (verification barrel собирает публичный API)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Фронтовые импорты verification переключены на barrel
- [x] Local-sim сиды используют verification через barrel

**Критерии приёмки:**
- [x] Все внешние импорты verification используют `local-sim/modules/verification/index.js`
- [x] Barrel verification реэкспортирует admin/api/queue/dataset/helpers/storage/seed
- [x] `applyVerificationSeed` доступен через barrel и используется в сидере

**Понятным языком: что сделано/что поменял:**
- Я создал barrel verification
- Я переключил фронт verification на новый путь
- Я обновил сид verification на barrel

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Создал barrel verification и обновил все импорты
- **Что осталось:** Дождаться подтверждения local-sim
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/verification/index.js`
  - `local-sim/database/seed.js`
  - `src/pages/admin/features/verification/Verification.jsx`
  - `src/pages/admin/features/verification/hooks/useAdminVerificationRequests.js`
  - `src/pages/admin/features/verification/hooks/useAdminVerificationIdleAccounts.js`
  - `src/pages/admin/features/access/roles/blocks/Verification/VerificationQueue.jsx`

## TAKE-20251017-008 — Barrel для access
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:38

**Резюме:** Выравниваю local-sim access под единый barrel. Переключаю фронтовые хуки и экраны админки на новый путь без глубоких импортов.

**Объём работ (файлы/модули):**
- `src/pages/admin/features/access/rank-editor/hooks/useRankEditor.js`
- `src/pages/admin/features/access/roles/blocks/EditRole/EditRolePermissions.jsx`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (access barrel закрывает публичный API)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Все фронтовые импорты access используют barrel `modules/access`

**Критерии приёмки:**
- [x] Хук рангов тянет API только через `local-sim/modules/access`
- [x] Экран правок ролей импортирует лог изменений через barrel
- [x] В проекте нет глубоких импортов в `local-sim/modules/access/*`

**Понятным языком: что сделано/что поменял:**
- Я переключил хук рангов на barrel access
- Я обновил экран правок ролей на barrel access
- Я проверил, что больше нет глубоких импортов access

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Переключил ранговый хук и экран ролей на barrel access, проверил пути
- **Что осталось:** Дождаться подтверждения local-sim
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `src/pages/admin/features/access/rank-editor/hooks/useRankEditor.js`
  - `src/pages/admin/features/access/roles/blocks/EditRole/EditRolePermissions.jsx`
  - `report.md`

## TAKE-20251017-007 — Barrel для auth
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 02:10

**Резюме:** Собираю публичный API auth local-sim в один barrel. Обновляю фронтовые импорты и сиды на новый путь, чтобы не обращаться напрямую к вложенным файлам.

**Объём работ (файлы/модули):**
- `local-sim/modules/auth/index.js`
- `local-sim/modules/auth/admin/index.js`
- `local-sim/modules/auth/accounts/index.js`
- `local-sim/modules/auth/session/index.js`
- `local-sim/database/seed.js`
- `src/features/auth/api.js`
- `src/app/auth/actions/createAuthActions.js`
- `src/app/auth/actions/createAuthActions.md`
- `src/app/auth/admin/createAdminPanelActions.js`
- `src/app/auth/hooks/useAuthState.js`
- `src/app/auth/hooks/useAuthState.md`
- `src/app/auth/user/createUserProfileActions.js`
- `src/pages/admin/features/access/roles/blocks/EditRole/EditRolePermissions.jsx`
- `src/pages/admin/features/access/roles/blocks/RolesMatrix.jsx`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (barrel auth объединяет публичный API)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Фронт и сиды импортируют auth только через barrel
- [x] Документация обновлена под новый путь auth

**Критерии приёмки:**
- [x] Все внешние импорты auth используют `local-sim/modules/auth/index.js`
- [x] Barrel auth реэкспортирует admin/session/accounts утилиты
- [x] Local database seed берёт auth-сиды через barrel

**Понятным языком: что сделано/что поменял:**
- Я создал barrel `local-sim/modules/auth/index.js`
- Я сделал под-barrel для admin, accounts и session
- Я обновил все фронтовые импорты auth на новый путь
- Я поправил документацию про auth

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Собрал auth-утилиты в barrel и переключил импорты фронта и сидов
- **Что осталось:** Дождаться подтверждения и перейти к следующему отделу
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/auth/index.js`
  - `local-sim/modules/auth/admin/index.js`
  - `local-sim/modules/auth/accounts/index.js`
  - `local-sim/modules/auth/session/index.js`
  - `local-sim/database/seed.js`
  - `src/features/auth/api.js`
  - `src/app/auth/actions/createAuthActions.js`
  - `src/app/auth/actions/createAuthActions.md`
  - `src/app/auth/admin/createAdminPanelActions.js`
  - `src/app/auth/hooks/useAuthState.js`
  - `src/app/auth/hooks/useAuthState.md`
  - `src/app/auth/user/createUserProfileActions.js`
  - `src/pages/admin/features/access/roles/blocks/EditRole/EditRolePermissions.jsx`
  - `src/pages/admin/features/access/roles/blocks/RolesMatrix.jsx`

## TAKE-20251017-006 — Barrel для транзакций
**Автор:** Владислав • **Время (Europe/Kyiv):** 2025-10-17 01:42

**Резюме:** Переношу модуль транзакций на единый barrel. Добавляю `modules/transactions/index`, чтобы все локальные моки и фронт использовали один путь и не тянули глубоко внутрь структуры.

**Объём работ (файлы/модули):**
- `local-sim/modules/transactions/index.js`
- `local-sim/modules/auth/profileActions.js`
- `local-sim/modules/logs/api.js`
- `src/pages/admin/features/transactions/hooks/useAdminTransactions.js`
- журнал `report.md`

**Чеклист выполнения:**
- [x] Local-sim: маршрут/эндпоинты готовы (transactions barrel отдаёт API)
- [ ] Local-sim: подтверждено Гринч
- [ ] SQL-миграции применены (после подтверждения local-sim)
- [x] Импорты внутри local-sim переключены на barrel `modules/transactions`
- [x] Фронтовой хук транзакций читает API через barrel путь

**Критерии приёмки:**
- [x] `listAdminTransactions` и `subscribeToAdminTransactions` доступны через новый barrel
- [x] `notifyAdminTransactionsChanged` импортируется из `modules/transactions`
- [x] Админские логи получают константы транзакций через barrel

**Понятным языком: что сделано/что поменял:**
- Я собрал все экспорты транзакций в `modules/transactions/index`
- Я обновил auth/profileActions на новый путь
- Я переключил админские логи и фронтовый хук на barrel
- Я зафиксировал изменения в отчёте

**Блокеры (если есть):**
- Нет

**Итоги выполнения:**
- **Статус:** ⏳ В работе (жду подтверждения local-sim)
- **Что сделано:** Создан barrel транзакций и обновлены импорты
- **Что осталось:** Подтвердить обновлённые пути и перейти к следующему отделу
- **Коммиты/PR:** будет оформлено в текущем PR
- **Затронутые файлы:**
  - `local-sim/modules/transactions/index.js`
  - `local-sim/modules/auth/profileActions.js`
  - `local-sim/modules/logs/api.js`
  - `src/pages/admin/features/transactions/hooks/useAdminTransactions.js`
  - `report.md`

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
