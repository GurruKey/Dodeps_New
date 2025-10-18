# Admin imports fix

**Тейк (как я понял)**
- При сборке admin verification/transactions блоков валятся импорты ../utils.js и ../constants.js.
- Нужно поправить относительные пути, чтобы сборка Vite проходила.

**С чем работал**
- `src/pages/admin/features/verification`
- `src/pages/admin/features/transactions`

**Изменённые файлы (кратко)**
- `src/pages/admin/features/verification/blocks/VerificationApprovedBlock/VerificationApprovedBlock.jsx` — поправил путь к utils.
- `src/pages/admin/features/verification/blocks/VerificationPartialBlock/VerificationPartialBlock.jsx` — поправил путь к utils.
- `src/pages/admin/features/verification/blocks/VerificationRejectedBlock/VerificationRejectedBlock.jsx` — поправил путь к utils.
- `src/pages/admin/features/verification/blocks/VerificationRequestsBlock/VerificationRequestsBlock.jsx` — поправил путь к utils.
- `src/pages/admin/features/transactions/blocks/TransactionsHistory/TransactionsHistory.jsx` — поправил пути к constants/utils/hooks.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [ ] I/O‑карта маршрутов актуальна

**Для понимания (простыми словами)**
- Поправил относительные пути импортов, чтобы блоки брали общие утилиты из уровня фичи.

**Итоги**
- Статус: ✅ Выполнено
- Ссылки: Нет
- Замечания: Нет

**Следующий шаг**
- Нет.
