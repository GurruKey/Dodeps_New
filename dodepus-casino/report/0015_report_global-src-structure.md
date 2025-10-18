# Глобальная структура src — этап 5

**Тейк (как я понял)**
- Продолжаю доводить структуру `src`: убираю лестницы `../../` и выношу alias для local-sim.
- Дочищаю barrels каталога и профиля, чтобы страницы брали блоки и хуки только из публичных точек.
- После правок готовлю финальную выверку: проверить, что все импорты идут через `@/...` или новый alias local-sim.

**План работ**
- Добавить alias `@local-sim/*` в `vite.config.js` и `jsconfig.json`.
- Перевести страницы и блоки admin/profile/catalog на alias `@local-sim/...` вместо многоуровневых путей.
- Подровнять импорты внутри `pages/profile/**` и `pages/catalog/**` на barrels `@/...`.

**Стартовое состояние**
- Local-sim не меняю, только фронтовой рефактор.
- Линтер всё ещё падает на старые ошибки (`local-sim`, `ThemeProvider`, `RoleGroup`).

**Что сделал**
- Добавил alias `@local-sim` в `vite.config.js` и `jsconfig.json`, чтобы обращаться к контрактам без лестниц `../../`.
- Перевёл админские фичи (promo, verification, access, communications, monitoring, transactions) на `@local-sim/modules/*`.
- Обновил `features/auth` и профиль рангов на новый alias `@local-sim`.
- Перевёл страницы каталога и профиля на alias-импорты `@/...` для barrels блоков/хуков.
- Завёл barrel `pages/profile/layout/meta/index.js` и использовал его в `ProfileSidebarBlock`.

**С чем работал**
- `vite.config.js`, `jsconfig.json`
- `src/app/auth/**`
- `src/features/auth/api.js`
- `src/pages/admin/**`
- `src/pages/profile/**`
- `src/pages/catalog/**`
- `report/0015_report_global-src-structure.md`

**Изменённые файлы (кратко)**
- `vite.config.js`, `jsconfig.json` — alias `@local-sim`.
- `app/auth/**/*`, `features/auth/api.js` — импорты мок-API через alias.
- `pages/admin/**/*` — обращения к local-sim только через `@local-sim/modules/*`.
- `pages/profile/**/*` — страницы и блоки используют barrels `@/pages/profile/...`.
- `pages/catalog/**/*` — страницы берут блоки и хуки через alias `@/...`.
- `report/0015_report_global-src-structure.md` — прогресс и список работ.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [ ] I/O‑карта маршрутов актуальна

**Итоги**
- Статус: ⏳ В работе
- Ссылки: Нет
- Замечания: Надо добить alias-импорты в оставшихся фичах, затем финальная проверка barrel'ов.

**Следующий шаг**
- Проверить оставшиеся страницы/фичи на предмет старых относительных импортов и подготовить завершающий отчёт.
