# Admin import barrels

**Тейк (как я понял)**
- Импорты админских блоков брали утилиты напрямую из файлов и ломались из-за неверных путей.
- Нужно дать единый barrel уровня shared и переподключить блоки/компоненты через него.

**С чем работал**
- `src/pages/admin/features/verification`
- `src/pages/admin/features/transactions`

**Изменённые файлы (кратко)**
- `src/pages/admin/features/verification/shared/index.js` — добавил barrel с экспортом утилит.
- `src/pages/admin/features/verification/blocks/*` — переключил импорты на shared barrel.
- `src/pages/admin/features/verification/components/*` — переключил импорты на shared barrel.
- `src/pages/admin/features/verification/page/AdminVerificationPage.jsx` — использует shared barrel вместо прямых импортов.
- `src/pages/admin/features/transactions/shared/index.js` — добавил barrel для констант и утилит.
- `src/pages/admin/features/transactions/blocks/TransactionsHistory/TransactionsHistory.jsx` — перевёл импорты на shared barrel.
- `src/pages/admin/features/transactions/components/*` — перевёл импорты на shared barrel.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [ ] I/O‑карта маршрутов актуальна

**Для понимания (простыми словами)**
- Добавил общий экспорт утилит/констант внутри фич, чтобы глубоко вложенные блоки брали их без сломанных путей.

**Итоги**
- Статус: ✅ Выполнено
- Ссылки: Нет
- Замечания: Нет

**Следующий шаг**
- Нет.
