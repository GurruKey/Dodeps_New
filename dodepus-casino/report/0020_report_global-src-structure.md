# Глобальная структура src — этап 10

**Тейк (как я понял)**
- Провожу финальный аудит `src/pages`, убираю остаточные глубокие импорты.
- Закрываю контуры админских фич, чтобы страницы и блоки тянулись через barrel’ы.

**С чем работал**
- `src/pages/admin/features/**/*`
- `report/0020_report_global-src-structure.md`

**Изменённые файлы (кратко)**
- `src/pages/admin/features/access/role-edit/page/AdminRoleEditPage.jsx` — перевёл импорт правок ролей на barrel `roles`.
- `src/pages/admin/features/access/roles/index.js` — раскрыл публичный экспорт блоков для соседних страниц.
- `src/pages/admin/features/communications/*/page/Admin*ChatPage.jsx` — подключил панель каналов через общий barrel фичи.
- `src/pages/admin/features/promo/list/index.js` — добавил реэкспорт таблицы и панели деталей.
- `src/pages/admin/features/promo/archive/page/AdminPromoArchivePage.jsx` — заменил глубокий импорт на публичный barrel `promo`.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [x] I/O‑карта маршрутов актуальна

**Для понимания (простыми словами)**
- Я убрал точечные относительные лестницы до блоков внутри админских фич.
- Я расширил barrels, чтобы ими могли пользоваться соседние страницы.
- Я зафиксировал этап 10 в отдельном отчёте.

**Итоги**
- Статус: ✅ Завершено
- Ссылки: нет
- Замечания: линтер проходит без ошибок, импорты ровные.

**Следующий шаг**
- Нет.
