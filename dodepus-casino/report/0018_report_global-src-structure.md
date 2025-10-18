# Глобальная структура src — этап 8

**Тейк (как я понял)**
- Продолжаю доводить страницы до единого шаблона `Feature/page/*.jsx` с компонентами `*Page`.
- Нужно убрать остаточные анонимные/неправильно названные компоненты и привести импорты маршрутов к barrel'ам `pages/**`.

**План работ**
- Проверить публичные страницы (home, lobby, game, auth, not-found) на совпадение имени файла и компонента.
- Переименовать компоненты на `*Page`, при необходимости поправить barrels и маршруты.
- Прогнать линтер и убедиться, что структура не ломает текущие алиасы.

**Стартовое состояние**
- Страницы home, lobby, game, login, register и not-found экспортируют компоненты без постфикса `Page`.
- Баррели уже существуют, но именование мешает поиску и единообразию.

**С чем работаю**
- `src/pages/home/page/HomePage.jsx`
- `src/pages/lobby/page/LobbyPage.jsx`
- `src/pages/game/page/GamePage.jsx`
- `src/pages/auth/login/page/LoginPage.jsx`
- `src/pages/auth/register/page/RegisterPage.jsx`
- `src/pages/not-found/page/NotFoundPage.jsx`
- `src/app/routing/AppRoutes.jsx`

**Что сделал**
- Переименовал компоненты страниц в `HomePage`, `LobbyPage`, `GamePage`, `LoginPage`, `RegisterPage`, `NotFoundPage`.
- Обновил маршруты `AppRoutes`, чтобы импортировать страницы по новым именам.
- Прогнал `npm run lint` — ошибок нет.

**Изменённые файлы (кратко)**
- `src/pages/home/page/HomePage.jsx` — компонент переименован в `HomePage`.
- `src/pages/lobby/page/LobbyPage.jsx` — компонент переименован в `LobbyPage`.
- `src/pages/game/page/GamePage.jsx` — компонент переименован в `GamePage`.
- `src/pages/auth/login/page/LoginPage.jsx` — компонент переименован в `LoginPage`.
- `src/pages/auth/register/page/RegisterPage.jsx` — компонент переименован в `RegisterPage`.
- `src/pages/not-found/page/NotFoundPage.jsx` — компонент переименован в `NotFoundPage`.
- `src/app/routing/AppRoutes.jsx` — обновлены импорты и использование страниц.

**Чеклист выполнения**
- [ ] Local‑sim: db/types/routes обновлены
- [ ] Local‑sim подтверждён
- [ ] Паритет схем local‑sim ↔ SQL; `migration-notes.md` обновлён
- [ ] Черновик/миграции SQL подготовлены (если нужно)
- [x] UI на Bootstrap/React‑Bootstrap (если применимо)
- [x] I/O‑карта маршрутов актуальна *(структура маршрутов не менялась)*
- [x] Линтер/тесты прогнаны

**Итоги**
- Статус: ⏳ В работе
- Ссылки: нет
- Замечания: базовые страницы теперь следуют паттерну `*Page`, структура маршрутов читабельнее.

**Следующий шаг**
- Проверить, остались ли фичи с несогласованными именами компонентов/баррелей, и подготовить финальный проход по `src`.
