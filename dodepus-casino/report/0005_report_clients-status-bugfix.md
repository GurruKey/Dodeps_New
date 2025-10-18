# Клиентский статус фикс

**Тейк (как я понял)**
- Ошибка инициализации DEFAULT_AUTH_STATUS в браузере.
- Нужно убрать циклическую зависимость в constants.

**С чем работал**
- local-sim/modules/auth
- local-sim/modules/clients

**Изменённые файлы (кратко)**
- `local-sim/modules/auth/constants.js` — вынес экспорт DEFAULT_AUTH_STATUS в отдельный модуль.
- `local-sim/modules/auth/statuses.js` — добавил модуль со статусом по умолчанию.
- `local-sim/modules/clients/constants.js` — подключил новый модуль статусов.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [x] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [ ] UI на Bootstrap/React‑Bootstrap (если применимо)
- [x] I/O‑карта маршрутов актуальна

**Для понимания (простыми словами)**
- Я вынес DEFAULT_AUTH_STATUS в отдельный файл, чтобы убрать цикл.
- Я обновил импорты клиентов, чтобы использовать новый модуль.

**Итоги**
- Статус: ✅ Выполнено
- Ссылки: нет
- Замечания: нет

**Следующий шаг**
- Нет.
