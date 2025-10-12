# Поток верификации: клиент и админ

Документ объясняет, как работает верификация в проекте: какие модули участвуют, что делает клиентская страница `/profile/verification`, как реагирует админка `/admin/verification`, и какие сценарии нужно проверять целиком.

## 1. Что проверяется

- Четыре модуля: `email`, `phone`, `address`, `doc`. Подписи и статусы заданы в общем сервисе. `normalizeStatus` приводит любые внешние значения к `idle`, `pending`, `approved`, `rejected`; `computeModuleLocks` решает, какие поля должны быть заблокированы, пока модуль на проверке. 【F:src/shared/verification/modules.js†L1-L157】【F:src/shared/verification/modules.js†L226-L259】
- Контекст клиента собирается через `createModuleContext`: почта требуется для `email`, номер из ≥10 цифр — для `phone`, адрес + персональные данные + файл категории `address` — для `address`, персональные данные + файл категории `identity` — для `doc`. 【F:src/pages/profile/verification/modules/utils.js†L1-L54】

## 2. Клиентская страница `/profile/verification`

### 2.1 Блок статусов

- `ModuleStatusWidget` показывает четыре кружка со статусами, текст подсказки и кнопки «Подтвердить»/«Отменить запрос». Компонент блокирует действия, если модуль уже на проверке или подтверждён, и выводит тост при успехе. 【F:src/pages/profile/verification/widgets/ModuleStatusWidget.jsx†L1-L266】
- При клике по кружку открывается модальное окно модуля. Подсказка `getHint` сообщает, каких данных не хватает или что модуль заблокирован. 【F:src/pages/profile/verification/modules/email/emailModule.jsx†L1-L24】【F:src/pages/profile/verification/modules/phone/phoneModule.jsx†L1-L38】【F:src/pages/profile/verification/modules/address/addressModule.jsx†L1-L66】【F:src/pages/profile/verification/modules/documents/documentsModule.jsx†L1-L78】

### 2.2 Формы и загрузка документов

- Формы берут данные из `useAuth` и повторно проверяют блокировки через `useVerificationState`. Клиент может обновить почту, телефон, адрес, ФИО, дату рождения, пол. При статусах `pending/approved` поля недоступны. 【F:src/pages/profile/verification/modules/email/EmailVerificationForm.jsx†L1-L101】【F:src/pages/profile/verification/modules/phone/PhoneVerificationForm.jsx†L1-L132】【F:src/pages/profile/verification/modules/address/AddressVerificationForm.jsx†L1-L143】【F:src/pages/profile/verification/modules/documents/PersonalDataVerificationForm.jsx†L1-L143】
- `DocumentUploader` загружает файл в `local-sim`: проверяет выбранный тип документа, запрещает загрузку при блокировке и сохраняет файл через `addVerificationUpload`. 【F:src/pages/profile/verification/modules/shared/DocumentUploader.jsx†L1-L115】

### 2.3 История отправок

- Блок `VerificationHistory` показывает простой список загруженных файлов. Если ничего не отправлено — выводится серый текст. 【F:src/pages/profile/verification/history/VerificationHistory.jsx†L1-L49】

## 3. Данные клиента и API

- `useVerificationState` берёт пользователя из `AuthProvider`, строит карту модулей и сводку через `useVerificationModules`. 【F:src/pages/profile/verification/state/useVerificationState.js†L1-L18】【F:src/shared/verification/useVerificationModules.js†L1-L17】
- `createUserProfileActions` пробрасывает методы `submitVerificationRequest`, `cancelVerificationRequest` и `addVerificationUpload` из `local-sim`. После выполнения действия пользователь в контексте обновляется. 【F:src/app/auth/user/createUserProfileActions.js†L1-L76】
- `local-sim/auth/profileActions.js` хранит заявки и загрузки в snapshot-е, разбивает общие заявки по модулям, добавляет историю и уведомляет админскую часть через событие. 【F:local-sim/auth/profileActions.js†L120-L457】

## 4. Админская страница `/admin/verification`

- Хук `useAdminVerificationRequests` подгружает заявки и подписывается на `ADMIN_VERIFICATION_EVENT`, чтобы страница обновлялась при любых изменениях со стороны клиента или администратора. 【F:src/pages/admin/features/verification/hooks/useAdminVerificationRequests.js†L1-L86】【F:local-sim/admin/features/verification/index.js†L239-L477】
- `Verification.jsx` группирует заявки по статусам («На проверке», «Частично», «Отклонено», «Подтверждено»), открывает модалку и вызывает `updateVerificationRequestStatus` либо `resetVerificationRequestModules`. 【F:src/pages/admin/features/verification/Verification.jsx†L1-L210】
- Логика админских действий нормализует поля, добавляет запись истории с ревьюером и синхронизирует снимок профиля. 【F:local-sim/admin/features/verification/index.js†L432-L724】

## 5. Сценарии end-to-end

Ниже перечислены сценарии, которые покрывают поток целиком. Каждый сценарий начинается на стороне клиента и заканчивается результатом в админке и обратным обновлением клиента.

1. **Подтверждение почты**
   - Клиент: вводит корректный e-mail в форме почты, жмёт «Сохранить», затем кнопку «Подтвердить» в модуле. 【F:src/pages/profile/verification/modules/email/EmailVerificationForm.jsx†L23-L77】【F:src/pages/profile/verification/widgets/ModuleStatusWidget.jsx†L95-L176】
   - Админ: в модалке модуля «Почта» выбирает «Подтвердить», пишет (опционально) комментарий и сохраняет. 【F:src/pages/admin/features/verification/components/VerificationRequestModal.jsx†L1-L200】
   - Результат: статус модуля меняется на ✅ у клиента, заявка переходит в блок «Подтверждено». 【F:src/pages/admin/features/verification/blocks/VerificationApprovedBlock.jsx†L1-L73】

2. **Подтверждение телефона**
   - Клиент: вводит номер (≥10 цифр), сохраняет, отправляет заявку через модуль «Телефон». 【F:src/pages/profile/verification/modules/phone/PhoneVerificationForm.jsx†L23-L105】
   - Админ: проверяет данные и подтверждает или отклоняет с комментарием. 【F:local-sim/admin/features/verification/index.js†L534-L620】
   - Результат: статус «Телефон» у клиента обновляется, блок «На проверке» или «Отклонено» в админке меняет счётчик. 【F:src/pages/admin/features/verification/blocks/VerificationRequestsBlock.jsx†L1-L132】【F:src/pages/admin/features/verification/blocks/VerificationRejectedBlock.jsx†L1-L109】

3. **Подтверждение адреса**
   - Клиент: заполняет страну, город, адрес, ФИО, дату рождения, пол; загружает файл с категорией `address`; отправляет заявку. 【F:src/pages/profile/verification/modules/address/AddressVerificationForm.jsx†L23-L131】【F:src/pages/profile/verification/modules/shared/DocumentUploader.jsx†L14-L91】
   - Админ: проверяет данные профиля и вложения в модалке, подтверждает либо отклоняет с указанием, чего не хватает. 【F:src/pages/admin/features/verification/components/VerificationRequestModal.jsx†L66-L171】
   - Результат: адрес блокируется или возвращается в состояние «Требуется подтверждение», история содержит запись решения. 【F:local-sim/admin/features/verification/index.js†L540-L620】

4. **Подтверждение документов личности**
   - Клиент: заполняет персональные данные, загружает документ категории `identity` (паспорт/ID), отправляет модуль «Документы». 【F:src/pages/profile/verification/modules/documents/PersonalDataVerificationForm.jsx†L23-L139】【F:src/pages/profile/verification/modules/documents/documentsModule.jsx†L1-L78】
   - Админ: сверяет персональные поля и вложения, подтверждает. 【F:src/pages/admin/features/verification/components/VerificationRequestModal.jsx†L66-L171】
   - Результат: все четыре модуля могут стать подтверждёнными, и карточка пользователя попадает в раздел «Подтверждено». 【F:src/pages/admin/features/verification/blocks/VerificationApprovedBlock.jsx†L1-L73】

5. **Отмена клиентом**
   - Клиент: нажимает «Отменить запрос» на модуле в статусе «На проверке». 【F:src/pages/profile/verification/widgets/ModuleStatusWidget.jsx†L177-L208】
   - Админ: получает событие обновления; заявка пропадает из блока «На проверке». 【F:src/pages/admin/features/verification/hooks/useAdminVerificationRequests.js†L37-L78】
   - Результат: модуль возвращается в «Требуется подтверждение», поля снова доступны для редактирования. 【F:src/shared/verification/modules.js†L260-L318】

6. **Повторная отправка после отказа**
   - Клиент: видит подсказку с причиной отказа, исправляет данные и снова отправляет модуль. 【F:src/pages/profile/verification/widgets/ModuleStatusWidget.jsx†L138-L166】
   - Админ: видит новую заявку с обновлённым таймштампом и может подтвердить. 【F:src/pages/admin/features/verification/Verification.jsx†L80-L149】
   - Результат: история заявки содержит оба решения; статус меняется на новый. 【F:local-sim/admin/features/verification/index.js†L540-L704】

7. **Сброс администратором**
   - Клиент: может запросить полный сброс после полной верификации (по договорённости). 【F:src/pages/admin/features/verification/components/VerificationRequestModal.jsx†L122-L166】
   - Админ: выбирает «Сбросить выбранные модули», отмечает галочками нужные поля, добавляет комментарий. 【F:local-sim/admin/features/verification/index.js†L620-L704】
   - Результат: выбранные модули падают в `idle`, клиент снова может редактировать данные и отправлять. 【F:src/shared/verification/modules.js†L260-L318】

8. **Новый пользователь без заявок**
   - Клиент: видит подсказку «Заполните данные…», кнопки «Подтвердить» отключены, пока не выполнены требования. 【F:src/pages/profile/verification/widgets/ModuleStatusWidget.jsx†L61-L121】
   - Админ: раздел «На проверке» пуст, карточка пользователя не появляется до первой отправки. 【F:src/pages/admin/features/verification/Verification.jsx†L36-L78】

## 6. Что проверить перед релизом

- Создать тестового пользователя, пройти сценарии 1–4, проверяя, что статусы и блокировки совпадают с описанием выше.
- Убедиться, что отмена (сценарий 5) убирает заявку из админки без перезагрузки страницы.
- После отклонения (сценарий 6) повторная заявка отображается с новым временем.
- Сброс (сценарий 7) возвращает модули в состояние «Требуется подтверждение» и открывает формы.
- В списке файлов (история) остаются все загруженные документы даже после подтверждения. 【F:src/pages/profile/verification/history/VerificationHistory.jsx†L1-L49】
