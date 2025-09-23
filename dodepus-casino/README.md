# Dodepus Casino — README (v0.6.0)

> Минимально-живой фронтенд казино без БД: игры подключаются как **пакеты** из `public/games/<provider>/<slug>/index.html` и встраиваются в сайт через `<iframe>`. В проекте есть гостевой режим + простая мок-аутентификация, лобби, провайдеры, категории, автоподхват обложек, светлая/тёмная тема и аккуратные проверки наличия файлов.

---

## Быстрый старт

```bash
# 1) Установить зависимости
npm i

# 2) Старт dev-сервера
npm run dev

# 3) Билд и предпросмотр
npm run build
npm run preview
```

**Точки входа**

* Dev: [http://localhost:5173](http://localhost:5173)
* Демо-игра: `/game/dodepus/coinflip` (пакет в `public/games/dodepus/coinflip/`)

---

## Технологии

* **React + Vite**
* **react-router-dom** — маршрутизация
* **Bootstrap 5.3 + react-bootstrap** — UI-компоненты и темизация через `data-bs-theme`
* **lucide-react** — иконки

---

## Структура проекта (ключевое)

```
public/
  games/
    dodepus/
      coinflip/
        index.html         # пакет игры
        cover.webp|png|jpg|jpeg|gif  # обложка (auto-detect)
    luckysoft/
      lucky777/
        index.html
src/
  app/
    App.jsx
    AuthContext.jsx         # мок-аутентификация + баланс (без БД)
    routes.jsx
    ThemeContext.jsx        # светлая/тёмная темы
  pages/
    Home.jsx
    Lobby.jsx
    Game.jsx                # тонкий контейнер
    Provider.jsx            # игры одного провайдера
    Providers.jsx           # список провайдеров
    Categories.jsx          # группировка по категориям
    game/
      GameCanvas.jsx        # iframe + проверки наличия файла пакета
      GameSidebar.jsx       # правая колонка (описание, провайдер, похожие)
      useGameData.js        # логика поиска игры и рекомендаций
  shared/
    ui/
      Header.jsx            # упрощённая шапка (лого, «Слоты», вход/регистрация)
      Footer.jsx            # подвал, совместимый с темами
      GameCover.jsx         # автоподхват cover.* рядом с index.html игры
  data/
    games.js                # фикстуры: providerSlug, slug, мета
index.html
vite.config.js              # фикс предбандлинга (optimizeDeps.entries)
```

---

## Маршруты

* Главная: `/`
* Лобби (требует входа): `/lobby`
  Поддерживает фильтры/поиск/сортировку. Синхронизация категории с `?cat=`.
* Игра: `/game/:provider/:slug`
  Совместимость со старым `/game/:slug` сохранена на время.
* Провайдер: `/providers/:provider`
* Все провайдеры: `/providers`
* Категории: `/categories`
* Профиль (требует входа): `/profile`
* Вход: `/auth`

**Шапка (Header)** — минималистично: лого слева, пункт «Слоты» (ссылка на `/lobby?cat=Слоты`), справа «Вход»/«Регистрация» (или «Выйти»).

---

## Игровые пакеты: структура и подключение

Игры поставляются в виде статических пакетов, которые сайт встраивает через `<iframe>`.

**Путь к пакету**:

```
/public/games/<providerSlug>/<gameSlug>/index.html
```

**Как добавить новую игру**

```bash
# генератор болванки (создаёт index.html)
node scripts/new-game.mjs <ProviderName> <GameSlug> --title "Title"

# примеры
node scripts/new-game.mjs Dodepus CoinFlip --title "Coin Flip"
node scripts/new-game.mjs LivePro "European Roulette" --title "European Roulette"
```

После этого:

1. Добавьте данные игры в `src/data/games.js` (см. ниже).
2. (Опционально) Положите обложку рядом с `index.html` — будут найдены имена `cover.*`, `thumb.*`, `poster.*` с расширениями `webp/png/jpg/jpeg/gif`.

**Фикстуры (`src/data/games.js`)**

```js
{
  id: 'g1',
  slug: 'coinflip',        // папка игры
  title: 'Coin Flip',
  provider: 'Dodepus',
  providerSlug: 'dodepus', // папка провайдера
  category: 'Слоты',       // или «Популярные», «Live», «Новые»
  rtp: 98.2,
  volatility: 'Low',
  description: 'Короткое описание...',
  tags: ['быстро','простые правила'],
}
```

---

## Обложки игр (auto-detect)

Компонент `GameCover` ищет картинку рядом с `index.html` игры:

* имена: `cover`, `thumb`, `poster`
* форматы: `webp`, `png`, `jpg`, `jpeg`, `gif`

При первом успешном `HEAD` получаем путь и показываем `<img>` с `object-fit: cover`. Если файлов нет — аккуратная заглушка 16×9.

**Где применяется**: карточки на главной/в лобби/странице провайдера, а также правая колонка страницы игры.

> Совет: хранить обложки в `WebP` \~1280×720, до \~300 KB.

---

## Страница игры: проверки и UX

* Встраивание идёт через компонент **`GameCanvas`**. Перед показом iframe делается запрос к `index.html` и **проверка на SPA-фоллбэк** Vite (когда файла не существует и дев-сервер отдаёт собственный `index.html`). Это избавляет от «странных 404 внутри iframe» и показывает понятный алерт с путём к файлу.
* Правая колонка вынесена в **`GameSidebar`**: обложка, описание/бейджи, ссылка на провайдера, похожие игры.
* В DEV выводится подсказка о правилах именования обложек; в продакшене она скрыта (`import.meta.env.DEV`).

---

## Лобби: фильтры, поиск, синхронизация с URL

* Поля: поиск по названию/провайдеру/тегам; фильтры по категории/провайдеру; сортировка по названию/RTP.
* Категория синхронизирована с `?cat=`. Переход из `/categories` подставляет нужное значение.
* Карточки игр ведут на новый маршрут `/game/:provider/:slug`.

---

## Провайдеры и категории

* `/providers` — плитки всех провайдеров с количеством игр и категориями.
* `/providers/:provider` — карточки игр конкретного провайдера.
* `/categories` — сгруппированные секции по категориям + ссылка «Все игры категории» (ведёт в лобби с `?cat=`).

---

## Темы (light/dark)

* **`ThemeContext`** хранит текущую тему (`light`/`dark`) и пишет её в `localStorage`.
* Переключатель темы расположен в шапке. Bootstrap автоматически подхватывает тему через `data-bs-theme` на `<html>`.
* `index.css` добавляет плавные переходы и деликатную подложку под тему.
* Подвал (`Footer`) использует `bg-body-tertiary`/`text-body-secondary`, чтобы корректно выглядеть в обеих темах.

---

## Аутентификация (мок)

* `AuthContext` реализует минимальный вход/выход (без БД) и баланс (виден в профиле). В продакшене будет заменён на реальную auth.
* Доступ в `/lobby` и `/profile` только для авторизованных.
* Главная для вошедших упрощена (нет гостевой «герой-плашки»).

---

## Конфигурация Vite

Чтобы Vite не пытался предбандлить HTML из `public/games/**`, ограничен список точек входа:

```js
// vite.config.js
optimizeDeps: {
  entries: ['src/main.jsx'],
}
```

Это убирает предупреждение `Failed to run dependency scan` и ускоряет старт dev-сервера.

---

## Скрипты и полезные команды

### Создание болванки игры

```bash
node scripts/new-game.mjs <ProviderName> <GameSlug> --title "Title"
```

Сгенерирует `public/games/<provider>/<slug>/index.html`.

### Windows PowerShell: создать папку вручную

```powershell
New-Item -ItemType Directory -Force -Path "public/games/dodepus/coinflip" | Out-Null
```

---

## Изменённые/добавленные файлы (v0.6.0)

* `vite.config.js` — ограничен `optimizeDeps.entries`
* `src/app/ThemeContext.jsx` — провайдер тем
* `src/index.css` — плавная темизация
* `src/shared/ui/Header.jsx` — лого, «Слоты», вход/регистрация/выход
* `src/shared/ui/Footer.jsx` — тема-aware подвал
* `src/shared/ui/GameCover.jsx` — автоподхват обложек игр
* `src/data/games.js` — фикстуры с `providerSlug`, хелперы `findGame`, `findGameBySlug`
* `src/pages/Home.jsx` — карточки «Популярное», кликабельные бейджи провайдеров, обложки
* `src/pages/Lobby.jsx` — фильтры/поиск/сортировка, `?cat=`
* `src/pages/Providers.jsx`, `src/pages/Provider.jsx`, `src/pages/Categories.jsx`
* `src/pages/Game.jsx` — тонкий контейнер
* `src/pages/game/GameCanvas.jsx` — проверки + iframe
* `src/pages/game/GameSidebar.jsx` — правая колонка
* `src/pages/game/useGameData.js` — хук
* `scripts/new-game.mjs` — генератор пакета игры

---

## Известные ограничения

* Аутентификация и баланс — мок, без БД.
* Нет реального API провайдеров — игры встроены как статические пакеты.
* Пока нет глобального состояния каталога/инвентаря, всё читается из фикстур.

---

## План следующих шагов

1. **Реальный Auth + профиль** (JWT/Supabase/…)
2. **Каталог игр из JSON/API** (вместо фикстур)
3. **SEO/OG-мета для игр** (title/description/cover)
4. **Локализация** (i18n)
5. **CI build** (lint + build) и предпрод превью

---

## Коммит (рекомендация)

**Версия:** `v0.6.0`

**Сообщение (Conventional Commits):**

```
feat(core): provider-based game packages, theming and covers; refactor(Game)

- add ThemeContext, light/dark theme toggle, index.css polish
- implement provider+/slug routing for games (/game/:provider/:slug)
- add GameCanvas (iframe + SPA-fallback detection), GameSidebar, useGameData
- add GameCover with auto-detect of cover/thumb/poster (webp/png/jpg/jpeg/gif)
- add Providers, Provider, Categories pages; Lobby sync with ?cat=
- simplify Header (logo, Slots, auth buttons) and theme-aware Footer
- add scripts/new-game.mjs to scaffold game packages
- fix Vite optimizeDeps scan entries

BREAKING CHANGE: game route migrated to /game/:provider/:slug (old path kept temporarily)
```

**Теги/релиз**

```bash
git add -A
git commit -m "feat(core): provider-based game packages, theming and covers; refactor(Game)" -m "BREAKING CHANGE: game route migrated to /game/:provider/:slug"
git tag v0.6.0
```

> Если нужен короткий русский вариант сообщения, вот подсказка:
>
> **feat:** провайдерные пакеты игр, темы (светлая/тёмная), обложки; рефактор страницы игры. Исправлен предбандлинг Vite, добавлены страницы провайдеров/категорий, синхронизация `?cat=` в лобби.

---

## FAQ

**Пустой iframe / «странный 404»?**
Скорее всего файла `index.html` игры нет — в дев-режиме Vite отдаёт свой SPA `index.html`. `GameCanvas` это детектит и показывает алерт с путём.

**Как задать обложку?**
Положите рядом с `index.html` файл `cover.webp` (или `thumb.*` / `poster.*`, поддерживаются: `webp/png/jpg/jpeg/gif`).

**Можно ли использовать GIF?**
Да, но он тяжелее. Рекомендуется WebP.

---

© Dodepus, 2025 — внутренний прототип
