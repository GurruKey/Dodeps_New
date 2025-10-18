**Тейк (как я понял)**
- Восстановить независимость модулей верификации профиля: почта, телефон, адрес, документы.
- При отмене/отправке каждый модуль должен работать изолированно, без влияния на соседние.
- Обновить контракты local-sim и фронт, чтобы статусы и блокировки корректно отражались по каждому модулю.


**С чем работал**
- local-sim/modules/auth/profileActions
- local-sim/modules/verification/storage
- src/shared/verification
- src/pages/profile/verification


**Изменённые файлы (кратко)**
- `local-sim/db/verification_requests.json` — разбил заявки по модулям, добавил `module_key`.
- `local-sim/db/verification_uploads.json`, `local-sim/db/verification_queue.json` — синхронизировал ссылки на новые заявки.
- `local-sim/types/verification.ts` — добавил тип `VerificationModuleKey` и поле `moduleKey`.
- `local-sim/modules/verification/helpers.js` — ввёл `normalizeModuleKey` и единый список модулей.
- `local-sim/modules/verification/storage/verificationDataset.js` — сохранил/прочитал `module_key`.
- `local-sim/modules/auth/profileActions.js` — нормализовал очередь заявок по модулям, фиксанул отмену.
- `src/shared/verification/modules.js` — учёл `moduleKey` при расчёте статусов.
- `local-sim/routes/admin.md` — задокументировал `moduleKey`.
- `local-sim/migration-notes.md` — добавил колонку `module_key` и описание.


**Чеклист выполнения**
- [x] Local‑sim: db/types/routes обновлены
- [x] Local‑sim подтверждён
- [x] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [ ] UI на Bootstrap/React‑Bootstrap (если применимо)
- [x] I/O‑карта маршрутов актуальна


**Для понимания (простыми словами)**
- Локальные заявки теперь создаются и отменяются по одному модулю.
- Фронт читает `moduleKey`, поэтому отмена не затрагивает соседние модули.
- Контракты local-sim зафиксированы и прошли валидацию (`npm run local-sim:validate`).


**Итоги**
- Статус: ✅ Выполнено
- Ссылки: нет
- Замечания: нет


**Следующий шаг**
- Нет.
