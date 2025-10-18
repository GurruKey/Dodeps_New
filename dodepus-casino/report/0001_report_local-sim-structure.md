# Local-sim structure refresh

**Тейк (как я понял)**
- Уточнить и стандартизировать структуру `local-sim`, чтобы проще подключать новые функции сайта.
- Вынести общие константы/хелперы в shared-слой и привести пути к единому виду.
- Подготовить документацию и репорт для дальнейшей разработки.

**С чем работал**
- `local-sim/` (db/types/routes/modules/database/scripts).
- `report/` для фиксации статуса тейка.

**Изменённые файлы (кратко)**
- `local-sim/modules/shared/tables.js` — зафиксировал карту таблиц/первичных ключей и именованные константы.
- `local-sim/modules/shared/localDatabase.js` — создал прокси к локальной БД (короткие пути для модулей).
- `local-sim/modules/shared/index.js` — общий barrel shared-слоя.
- `local-sim/modules/index.js` — добавил публичный barrel для доменных модулей.
- `local-sim/modules/*/constants.js` — перевёл константы на shared-экспорты, убрал дубли строк.
- `local-sim/modules/*/storage/*.js` — обновил импорты локальной БД на shared-прокси.
- `local-sim/database/schema.js` — собирает схему из `TABLE_PRIMARY_KEYS`.
- `local-sim/scripts/validateCanonicalDataset.js` — использует `TABLES` для меток и сообщений.
- `local-sim/README.md` — задокументировал обновлённую структуру.
- `report/report_local-sim-structure_0001.md` — отчёт по тейку.

**Чеклист выполнения**
- [x] Local‑sim: db/types/routes обновлены (структура стандартизирована, данные без изменений)
- [x] Local‑sim подтверждён (`npm run local-sim:validate`)
- [x] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён (требуемых правок не потребовалось, паритет сохранён)
- [ ] Черновик/миграции SQL подготовлены (не требовались)
- [ ] UI на Bootstrap/React‑Bootstrap (не применимо)
- [x] I/O‑карта маршрутов актуальна (структура не нарушена)

**Для понимания (простыми словами)**
- Вынес названия таблиц и первичных ключей в единый shared-модуль.
- Привёл импорты локальной БД к коротким путям через shared-прокси.
- Обновил валидационный скрипт и документацию, чтобы новые таблицы добавлялись в одном месте.

**Итоги**
- Статус: ✅ Выполнено
- Ссылки: —
- Замечания: `npm run local-sim:validate` предупреждает о future deprecations `assert` (текущее состояние)

**Следующий шаг**
- Нет.
