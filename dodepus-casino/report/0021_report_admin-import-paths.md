# Admin imports fix

**Тейк (как я понял)**
- В админских фичах неправильно собраны относительные пути до barrel `components`.
- Из-за этого Vite не находит `../components/index.js` и страница падает.
- Нужно поправить пути, чтобы сборка снова видела barrels.

**С чем работал**
- `src/pages/admin/features/verification`
- `src/pages/admin/features/transactions`

**Изменённые файлы (кратко)**
- `src/pages/admin/features/verification/blocks/*/Verification*Block.jsx` — поправил относительный путь к `components/index.js`.
- `src/pages/admin/features/transactions/blocks/TransactionsHistory/TransactionsHistory.jsx` — поправил путь к barrel компонентам.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [ ] I/O‑карта маршрутов актуальна

**Для понимания (простыми словами)**
- Я починил относительные пути к barrel компонентам в блоках.
- Я вернул рабочие импорты для верификаций и транзакций.

**Итоги**
- Статус: ✅ Выполнено
- Ссылки: нет
- Замечания: lint прошёл успешно.

**Следующий шаг**
- Нет.
