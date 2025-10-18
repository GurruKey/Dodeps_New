# Глобальная структура src — этап 4

**Тейк (как я понял)**
- Продолжаю чистить `src`: довожу alias-импорты в `app/**` и admin-фичах.
- Удаляю дубли старых auth-форм и настраиваю общий barrel `shared/rank` без deep-imports.
- Навожу порядок в отчётах: фиксирую прогресс и следующий шаг.

**План работ**
- Переподключить `AppRoutes`, `RequireAuth/RequireAdmin`, `AuthProvider` на `@/...` импорты.
- Свести admin verification и rank-editor к `@/shared/*` barrel'ам.
- Расширить `shared/rank/index.js` и обновить все вызовы `RankBadge`.
- Удалить legacy-файлы auth-форм (верхний уровень) и проверить barrels.

**Стартовое состояние**
- Local-sim не трогаю: фронтовой рефактор.
- Линтер всё ещё падает на старых ошибках (`local-sim`, `ThemeProvider`, `RoleGroup`).

**Следующий шаг**
- Выполнить план: alias-импорты, barrels, чистка дублей auth.

**Что сделал**
- Перевёл `AppRoutes` и гардов на алиасы `@/...`, почистил импорты `AuthProvider` и всех `useAuth/useTheme`.
- Удалил устаревшие auth-формы из корня `features/auth`, оставил версии в `blocks/`.
- Расширил `shared/rank` barrel, добавил `components/index.js` и перевёл все `RankBadge` на новый экспорт.
- Обновил admin verification на `@/shared/verification`.

**С чем работал**
- `src/app/routing/**`
- `src/app/providers/auth/AuthProvider.jsx`
- `src/app/providers/**/*`
- `src/features/auth/blocks/**`
- `src/features/auth/index.js`
- `src/shared/rank/**`
- `src/pages/admin/features/**`
- `src/pages/admin/layout/AdminLayout.jsx`
- `src/pages/auth/**`
- `report/0014_report_global-src-structure.md`

**Изменённые файлы (кратко)**
- `app/routing/**/*` — alias-импорты.
- `app/providers/**/*` — `@/app/auth`, `@/app/providers`.
- `features/auth/*` — удалил дубли форм, оставил barrels.
- `shared/rank/**/*` — общий экспорт компонентов и эффектов.
- `pages/admin/features/**/*` — `@/shared/verification`, `RankBadge`, `@/app/providers`.
- `pages/profile/rank/**/*` — новые импорты `RankBadge`.
- `pages/auth/**/*` — `useAuth` через `@/app/providers`.

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
- Замечания: Линтер по-прежнему падает на старых ошибках (`local-sim`, `ThemeProvider`, `RoleGroup`).

**Следующий шаг**
- Дочистить alias-импорты в остальных фичах (`features/**`, `pages/catalog`) и подготовить финальную выверку barrels.
