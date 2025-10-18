# Admin log path rename

**Тейк (как я понял)**
- Нужно переименовать фичу admin/log-admin на admin/log.
- Обновить пути, импорты и контракты, чтобы всё ссылалось на новое имя.

**С чем работал**
- local-sim/modules/logs/constants.js.
- src/pages/admin/features/monitoring/*.
- Роутинг админки.

**Изменённые файлы (кратко)**
- `local-sim/modules/logs/constants.js` — обновил ключ секции на `log`.
- `src/app/routing/AppRoutes.jsx` — поправил путь роутинга на `/log`.
- `src/pages/admin/layout/meta/navItems.js` — обновил ключ и ссылку в меню.
- `src/pages/admin/features/index.js` — перенастроил barrel на новую директорию.
- `src/pages/admin/features/monitoring/index.js` — обновил экспорт фичи.
- `src/pages/admin/features/monitoring/log/*` — переименовал директорию `log-admin` в `log`.

**Чеклист выполнения**
- [x] Local‑sim: db/types/routes обновлены
- [x] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [ ] UI на Bootstrap/React‑Bootstrap (если применимо)
- [ ] I/O‑карта маршрутов актуальна

**Для понимания (простыми словами)**
- Я переименую фичу и пути навигации админского лога.
- Я синхронизирую контракты local-sim с новым путём.

**Итоги**
- Статус: ✅ Выполнено
- Ссылки: —
- Замечания: —

**Следующий шаг**
- Нет.
