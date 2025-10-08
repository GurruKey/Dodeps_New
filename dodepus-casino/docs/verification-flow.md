# Поток верификации: реализация vs требования

Документ описывает, как текущая реализация покрывает ожидания из `task.md`, какие модули участвуют в клиентском и админском потоке, и какие сценарии поддержаны.

## 1. Сопоставление с шагами плана

| Шаг плана | Что требовалось | Реализация сейчас |
| --- | --- | --- |
| 1. Клиентская папка `profile/verification` | Подкаталоги `page`, `widgets`, `forms`, `state`, `actions`, `history`, `services`. | Структура выровнена: страница `page/VerificationPage.jsx`, статусы `widgets/ModuleStatusWidget.jsx`, формы `forms/EmailPhoneVerificationForm.jsx`, `forms/AddressVerificationForm.jsx`, `forms/DocumentsVerificationForm.jsx`, состояние `state/useVerificationState.js`, действия `actions/useVerificationActions.js`, история `history/VerificationHistory.jsx`, сервисы `services/verificationServices.js`. |
| 2. Админка `admin/verification` | Аккордеоны, поиск, карточки, модалка, слой данных. | Страница `Verification.jsx` управляет поиском и группировкой, секции вынесены в `blocks`, модалка и бейджи в `components`, данные подгружает `hooks/useAdminVerificationRequests.js`. |
| 3. `local-sim` | Таблицы, seed, логика, API. | Клиентские действия (`local-sim/auth/profileActions.js`) и админские (`local-sim/admin/verification.js`) поддерживают отправку, отмену, решения, сброс, историю и уведомления. |
| 4. Навигация | Маршруты профиля и админки. | Маршруты `profile/personal`, `profile/verification`, `admin/verification` зарегистрированы и доступны через layout’ы. |
| 5. Общие статусы | ◻️/❓/✅/❌, прогресс x/4, история. | Статусы нормализуются в `shared/verification/modules.js`, прогресс собирается через `summarizeModuleStates`, история отображается в клиентском и админском UI. |
| 6–9. Клиентские блокировки, отмена, повторная отправка | Блокировать поля на ❓/✅, разрешать отмену и повторную отправку. | Поля персональных данных и адреса блокируются при `pending/approved`, кнопка «Отменить запрос» доступна для модулей в статусе ❓, повторная отправка доступна после `idle/❌`. |
| 10–13. Работа админа, перемещения, поиск | Модалка, история, фильтры. | Модалка поддерживает подтверждение, отказ, сброс, историю и правку адреса; поиск и группировка реализованы по статусам. |
| 14. Роли и доступы | Клиент без имён админов, админ видит имена. | Клиентская история скрывает имена, админская модалка показывает `reviewer`. |
| 15. Тестовые сценарии | Все ключевые сценарии. | Отправка, отказ, повторная отправка, отмена, сброс и перемещения по секциям выполняются. |
| 16–19. Общая связка и готовность к демо | Единые правила, единый источник данных, готовность к замене API. | Клиент и админ работают через общий `local-sim`, история и статусы синхронизированы, переход на API потребует лишь замены сервисного слоя. |

## 2. Модули и данные

### 2.1 Модули верификации

Четыре ключа: `email`, `phone`, `address`, `doc`. Сервисный слой (`shared/verification/modules.js`) задаёт подписи, нормализует статусы, считает сводку и таймлайн. 【F:dodepus-casino/src/shared/verification/modules.js†L1-L194】【F:dodepus-casino/src/pages/profile/verification/services/verificationServices.js†L1-L12】

### 2.2 Статусы и блокировки

`normalizeStatus` приводит внешние значения к `idle`, `pending`, `approved`, `rejected`. Функции `isModuleLocked` и `computeModuleLocks` определяют, нужно ли блокировать поля. 【F:dodepus-casino/src/shared/verification/modules.js†L9-L119】

### 2.3 История

`buildVerificationTimeline` собирает события отправки, решений, отмен и сбросов. Для отмен добавляется `type: 'cancelled'`, актор фиксируется как `client`, для административных действий — `admin`. 【F:dodepus-casino/src/shared/verification/modules.js†L194-L360】

## 3. Клиентский интерфейс `profile/verification`

### 3.1 Состояние и действия

Хук `useVerificationState` возвращает пользователя, статусы модулей, сводку и карту блокировок. `useVerificationActions` пробрасывает отправку, отмену и загрузку документов. 【F:dodepus-casino/src/pages/profile/verification/state/useVerificationState.js†L1-L18】【F:dodepus-casino/src/pages/profile/verification/actions/useVerificationActions.js†L1-L14】

### 3.2 Страница и виджеты

`page/VerificationPage.jsx` собирает статусы, две формы данных, блок загрузки документов и историю событий. 【F:dodepus-casino/src/pages/profile/verification/page/VerificationPage.jsx†L1-L24】

### 3.3 Формы клиента

`EmailPhoneVerificationForm` и `AddressVerificationForm` обновляют контакты и персональные данные напрямую из экрана верификации, повторяя блокировки модулей и добавляя подсказки. 【F:dodepus-casino/src/pages/profile/verification/forms/EmailPhoneVerificationForm.jsx†L1-L199】【F:dodepus-casino/src/pages/profile/verification/forms/AddressVerificationForm.jsx†L1-L259】

### 3.4 Статусы и действия клиента

`ModuleStatusWidget` показывает прогресс, подсказки, кнопки «Подтвердить» и «Отменить запрос». Кнопка отмены доступна для модулей в статусе ❓ и вызывает `cancelVerificationRequest`. После отмены выводится уведомление, статусы возвращаются в ◻️, поля разблокируются. 【F:dodepus-casino/src/pages/profile/verification/widgets/ModuleStatusWidget.jsx†L1-L260】

Условия готовности:
- `email` — заполненная почта.
- `phone` — номер ≥10 цифр.
- `address` — страна/город/адрес + ФИО/дата рождения/пол.
- `doc` — выполнены требования адреса + загружен документ.

### 3.5 Загрузка документов

`DocumentsVerificationForm` учитывает блокировки: если выбранная категория находится на проверке или подтверждена, формы и зона загрузки выключены и показывают подсказку. 【F:dodepus-casino/src/pages/profile/verification/forms/DocumentUploadForm.jsx†L1-L202】

### 3.6 История для клиента

`VerificationHistory` выводит таблицу событий и загрузок. Для отмен отображается статус «Запрос отменён клиентом», для административных действий — «Статусы сброшены администратором» и бейдж «Администратор». 【F:dodepus-casino/src/pages/profile/verification/history/VerificationHistory.jsx†L1-L103】

## 4. Персональные данные и блокировки

Формы на `/profile/personal` читают `computeModuleLocks` и блокируют поля на статусах ❓/✅:
- Контакты: номер недоступен, пока модуль телефона на проверке или подтверждён. 【F:dodepus-casino/src/pages/profile/personal/blocks/ContactsBlock/ContactsBlock.jsx†L1-L155】
- Имя и фамилия: блокируются при проверке адреса или документов. 【F:dodepus-casino/src/pages/profile/personal/blocks/NameBlock/NameBlock.jsx†L1-L81】
- Пол и дата рождения: доступны только при разблокированном адресе/документах. 【F:dodepus-casino/src/pages/profile/personal/blocks/GenderDobBlock/GenderDobBlock.jsx†L1-L124】
- Адрес: изменяется только до отправки или после отмены/сброса. 【F:dodepus-casino/src/pages/profile/personal/blocks/AddressBlock/AddressBlock.jsx†L1-L108】

## 5. Админский интерфейс

`Verification.jsx` группирует карточки по статусам, управляет поиском, открывает модалку и вызывает `updateVerificationRequestStatus`/`resetVerificationRequestModules`. Карточки отображают прогресс, таймстемпы и счётчик вложений. 【F:dodepus-casino/src/pages/Admin/verification/Verification.jsx†L1-L236】

Модалка `VerificationRequestModal` поддерживает режимы «Подтвердить», «Отклонить», «Сбросить», «Просмотр», отображает историю и вложения, требует комментарий при отказе и сбросе. 【F:dodepus-casino/src/pages/Admin/verification/components/VerificationRequestModal.jsx†L1-L200】

## 6. Локальный симулятор

### 6.1 Отправка и отмена (клиент)

`submitVerificationRequest` создаёт или дополняет открытую заявку. `cancelVerificationRequest` проверяет, что запрос ещё не обработан администратором, снимает выбранные модули, добавляет запись истории со статусом `cancelled` и возвращает заявку в `idle` (если всё снято) или `pending`. 【F:dodepus-casino/local-sim/auth/profileActions.js†L260-L456】

### 6.2 Действия администратора

`updateVerificationRequestStatus` и `resetVerificationRequestModules` нормализуют статусы, обновляют историю, фиксируют администратора и уведомляют подписчиков `ADMIN_VERIFICATION_EVENT`. 【F:dodepus-casino/local-sim/admin/verification.js†L432-L724】

### 6.3 Общие таблицы и API

Общий доступ к данным вынесен в `local-sim/tables/verification.js`, где описаны чтение и обновление снимка профиля. 【F:dodepus-casino/local-sim/tables/verification.js†L1-L52】 Логика нормализации статусов и полей собрана в `local-sim/logic/verificationHelpers.js`. 【F:dodepus-casino/local-sim/logic/verificationHelpers.js†L1-L100】 Предустановленные заявки для тестов описаны в `local-sim/seed/verificationSeed.js`. 【F:dodepus-casino/local-sim/seed/verificationSeed.js†L1-L102】 Клиентский и административный API собраны в `local-sim/api/verification.js`. 【F:dodepus-casino/local-sim/api/verification.js†L1-L8】

## 7. Поддерживаемые сценарии

| Сценарий | Выполнено |
| --- | --- |
| Регистрация по почте → добавление номера → подтверждение номера | ✔️ — при заполненном номере кнопка «Подтвердить» активна, админ может утвердить. |
| Регистрация по номеру → подтверждение почты | ✔️ — модуль «Почта» доступен при заполненном email. |
| Адрес: неполные данные → подсказка → дозаполнение → отправка | ✔️ — подсказки в статусах объясняют, чего не хватает, поля блокируются после отправки. |
| Отмена на ❓ → редактирование → повторная отправка | ✔️ — кнопка «Отменить запрос» активна, история фиксирует отмену, поля разблокируются. |
| Админ: подтверждение/отказ + комментарий | ✔️ — модалка требует комментарий при отказе, история отображает решение. |
| Сброс из «Верифицировано» → падение x/4 и переход в «Частичную» | ✔️ — `resetVerificationRequestModules` обнуляет выбранные модули и перемещает карточку. |

## 8. Готовность к демо и следующая интеграция

- Карточки в админке сгруппированы по статусам, поиск раскрывает подходящую секцию.
- Клиент видит четыре модуля, может отправлять, отменять и повторять заявки, видит комментарии отказов.
- История синхронизирована между клиентом и админом; актор (клиент/админ) помечается бейджами.
- Переход на реальный сервер потребует замены вызовов из `services/verificationServices.js` на HTTP-API при сохранении интерфейсов и статусов.
