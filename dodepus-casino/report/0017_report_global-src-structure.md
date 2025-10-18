# Глобальная структура src — этап 7

**Тейк (как я понял)**
- Продолжил финальную чистку `src`: избавляюсь от предупреждений линтера и довожу общие провайдеры/баррели до консистентного вида.
- Параллельно довожу `local-sim`, чтобы контракты и проверочные скрипты не ломали линт и соответствовали новым правилам.

**План работ**
- Поправить проблемные модули (ThemeProvider, profile layout, role groups) так, чтобы `react-refresh` и `no-unused-vars` не срабатывали.
- Причесать `local-sim`: заменить JSON-импорты на `createRequire`, удалить неиспользуемые утилиты, подтянуть скрипты в Node-окружение.
- Прогнать `npm run lint` и убедиться, что ошибок не осталось.

**Стартовое состояние**
- После этапа 6 линт падал на ThemeProvider, admin role groups и нескольких helper'ах local-sim.
- В `local-sim` использовались `assert { type: 'json' }`, которые не понимал ESLint.

**Что сделал**
- Разделил контекст/хук темы и компонент провайдера, устранил пустые `catch`, добавил явное логирование ошибок.
- Переписал профильный layout на `createElement`, убрал варнинги по алиасам и JSX-переменным.
- Причесал admin role groups: metadata теперь висит на компонентах, баррель собирает их статически без доп. экспортов.
- Вынес `createRequire` в `local-sim` и очистил скрипты/модули от неиспользуемых сущностей, добавил Node-глобалы в `eslint.config.js`.
- Исправил `useVerificationModules`, чтобы зависимость `useMemo` была стабильной.
- Прогнал `npm run lint` — теперь без ошибок.

**С чем работаю**
- `src/app/providers/theme/**`
- `src/pages/admin/features/access/roles/blocks/EditRole/roleGroups/**`
- `src/pages/profile/layout/blocks/ProfileBlocksLayout/**`
- `src/shared/verification/useVerificationModules.js`
- `local-sim/database/seed.js`
- `local-sim/modules/auth/accounts/seedAccounts.js`
- `local-sim/modules/auth/profileExtras.js`
- `local-sim/modules/verification/{admin.js,seed.js}`
- `local-sim/scripts/validateCanonicalDataset.js`
- `eslint.config.js`
- `report/0017_report_global-src-structure.md`

**Изменённые файлы (кратко)**
- `eslint.config.js` — добавил Node-override и поднял `ecmaVersion`.
- `src/app/providers/theme/**` — вынес контекст, подчистил try/catch, настроил баррель.
- `src/pages/admin/features/access/roles/blocks/EditRole/roleGroups/**` — metadata через статические поля, обновлённый индекс.
- `src/pages/profile/layout/blocks/ProfileBlocksLayout/ProfileBlocksLayout.jsx` — `createElement` вместо JSX для произвольного контейнера.
- `src/shared/verification/useVerificationModules.js` — стабильные зависимости `useMemo`.
- `local-sim/**` — JSON через `createRequire`, удалены неиспользуемые значения, мелкие фиксы нормализации.
- `report/0017_report_global-src-structure.md` — текущий статус этапа.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [x] I/O‑карта маршрутов актуальна *(затронутые скрипты local-sim не меняют контракт)*

**Итоги**
- Статус: ⏳ В работе
- Ссылки: нет
- Замечания: линт теперь чистый; перед следующим этапом можно заняться ревизией оставшихся страниц/баррелей.

**Следующий шаг**
- Проверить остальные фичи на единый паттерн (barrels, `@/`-импорты) и подготовить финализацию структуры `src`.
