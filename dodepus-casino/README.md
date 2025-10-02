# Dodepus Casino — Frontend (v0.7, draft)

> **Эта версия README расширяет и заменяет v0.6.** Ниже — полный обзор актуальной структуры, фич, сценариев разработки и список изменений по сравнению с v0.6.

---

## Содержание

1. Быстрый старт
2. Технологии и архитектура
3. Структура проекта
4. Роутинг и навигация
5. Хранилище пользователя (AuthContext)
6. Профиль: вкладки и блоки
7. UI-компоненты и темы
8. Стили и каркас приложения (sticky footer)
9. История транзакций: модель и отображение
10. Как добавить новую вкладку/блок
11. TODO / дорожная карта
12. **Что изменилось с v0.6 (breakdown)**

---

## 1) Быстрый старт

```bash
# установка
npm i

# запуск dev
npm run dev

# сборка
npm run build
```

> Требования: Node 18+.

---

## 2) Технологии и архитектура

* React 18, React Router v6
* React-Bootstrap 2 (Bootstrap 5.3)
* Lucide-react (иконки)
* **Тёмная/светлая тема** через `data-bs-theme` и локальный переключатель (Header)
* **AuthContext** — единое фронтенд-хранилище пользователя с сохранением в `localStorage`
* Feature-based организация для профиля: вкладки → блоки

---

## 3) Структура проекта (актуальная)

```
local-sim/
  auth/
    api.js                 # локальный API авторизации (localStorage)
    composeUser.js         # объединение записи пользователя и экстрас
    profileExtras.js       # чтение/запись локальных данных профиля
    constants.js           # ключи localStorage
    accounts/
      seedAccounts.js      # сид-данные пользователей
      seedLocalAuth.js     # заполнение локального хранилища
    session/
      initAuthEffect.js    # восстановление сессии и подписка на изменения

src/
  app/
    App.jsx                  # каркас min-vh-100 + sticky footer
    routes.jsx               # маршруты, защищённые секции
    AuthContext.jsx          # пользователь, баланс, транзакции, профиль

  pages/
    Home.jsx
    Lobby.jsx
    Game.jsx
    Admin.jsx
    Categories.jsx
    Providers.jsx
    Provider.jsx

    auth/
      Login.jsx
      Register.jsx

    profile/
      ProfileLayout.jsx      # левое меню с разделителями и бейджем баланса
      Personal.jsx            # Вкладка «Персональные данные»
      Wallet.jsx              # Вкладка «Баланс» (3 блока)
      Terminal.jsx            # Вкладка «Терминал» (2 блока)
      History.jsx             # Вкладка «История транзакций»
      Verification.jsx        # Вкладка «Верификация»
      Promos.jsx              # Вкладка «Акции для игры»
      Season.jsx              # Вкладка «Сезон»
      GamesHistory.jsx        # Вкладка «История игр»

      blocks/
        Personal/
          AccountIdBlock.jsx
          NicknameBlock.jsx
          NameBlock.jsx
          GenderDobBlock.jsx
          SocialStatusBlock.jsx
          AddressBlock.jsx
          ContactsBlock.jsx
          AuthenticatorBlock.jsx
        Wallet/
          BalanceSummaryBlock.jsx
          RealBalanceBlock.jsx
          WithdrawableBlock.jsx
        Terminal/
          DepositBlock.jsx
          WithdrawBlock.jsx
        History/
          TransactionsBlock.jsx

  shared/
    ui/
      Header.jsx              # логотип, Профиль, выход-иконка, переключатель темы
      Footer.jsx
      GameCard.jsx            # карточка игры с оверлеем и CTA
      GameCover.jsx

  data/
    games.js                  # фикстуры игр

index.css                      # доп. стили (карточки, sidebar, balance)
main.jsx                       # bootstrap + index.css
```

---

## 4) Роутинг и навигация

Основные пути: `/`, `/lobby`, `/game/:provider/:slug`, `/login`, `/register`, `/profile/*`.

В `/profile` активны вкладки в **таком порядке**:

```
Баланс
История транзакций
Терминал
-------------------
Персональные данные
Верификация (жёлтая метка если требуется внимание)
-------------------
Акции для игры
Сезон
-------------------
История игр
```

* Все `/profile/*` — за Protected Route (`RequireAuth`).
* Перенаправление `/profile` → `/profile/personal`.

---

## 5) Хранилище пользователя (AuthContext)

Сохраняется в `localStorage` под ключом `dodepus_auth_v1`.

**Модель** (основные поля):

```ts
id: string
email: string | null
phone: string | null
emailVerified: boolean
mfaEnabled: boolean
nickname: string
firstName: string
lastName: string
gender: 'male' | 'female' | 'unspecified'
dob: 'YYYY-MM-DD' | null
socialStatus: 'employed' | 'retired' | 'student' | 'unemployed'
country: string, city: string, address: string
balance: number, currency: 'USD' | 'UAH' | ...
transactions: Array<{
  id: string,
  amount: number,
  currency: string,
  type: 'deposit' | 'withdraw',
  method: 'bank' | 'crypto' | 'card' | 'other',
  status: 'success' | 'failed' | 'pending',
  date: ISOString
}>
```

**API контекста**:

```ts
login(identifier: string)             // email или телефон
logout()
setBalance(value: number)
addBalance(delta: number)
updateProfile(patch: Partial<User>)
addTransaction(tx: Partial<Transaction>)
```

> Все изменения проходят через `normalizeUser()` — дефолты выставляются централизованно.

---

## 6) Профиль: вкладки и блоки

### 6.1 Баланс (`Wallet.jsx`)

* **BalanceSummaryBlock** — крупный общий баланс; кнопки «Вывод средств» и «Депозит» открывают `/profile/terminal#withdraw|#deposit`.
* **RealBalanceBlock** — реальный баланс (пока = общий).
* **WithdrawableBlock** — доступно на вывод (пока = общий).

### 6.2 Терминал (`Terminal.jsx`)

* **DepositBlock** (справа) — пополнение `addBalance(+amount)`, пресеты.
* **WithdrawBlock** (слева) — вывод `addBalance(-amount)`, проверка доступной суммы.

### 6.3 История транзакций (`History.jsx`)

* **TransactionsBlock** — таблица: сумма, тип (Депозит/Вывод · Банк/Крипто/Карта/Другое), дата, «Копировать ID», статус (зелёный/красный/жёлтый).

### 6.4 Персональные данные (`Personal.jsx`)

Блоки: ID аккаунта, Никнейм, Имя/Фамилия, Пол/Дата рождения, Социальный статус, Страна/Город/Адрес, Телефон/Email (+ заглушка «Подтвердить»), **Аутентификатор (гусь 🪿: красный/зелёный)**.

### 6.5 Верификация

* Заглушка-страница + **индикатор в меню**: если `emailVerified=false` или отсутствуют важные поля (фио, dob, адрес) — название вкладки и иконка жёлтые.

### 6.6 Прочее

* Акции для игры — заглушка.
* Сезон — заглушка.
* История игр — заглушка.

---

## 7) UI-компоненты и темы

### Header

* Слева — логотип и название.
* Справа для гостя: «Вход» / «Регистрация».
* Справа для авторизованного: кнопка «Профиль», иконка-выход, **переключатель темы**.

### Карточки игр (`GameCard`)

* Обложка 16:9, на ховер — затемнение, лёгкий блюр и зум + CTA «Играть сейчас».
* Снизу только: **Название** и **Провайдер**.

### Тема (ThemeToggle)

* `localStorage: theme`, атрибуты `data-bs-theme`/`data-theme` на `<html>`, Bootstrap 5.3 подхватывает.

---

## 8) Каркас приложения и стики-футер

`App.jsx` использует Bootstrap-утилиты: `min-vh-100` + `d-flex flex-column` + `flex-grow-1`, благодаря чему футер прижат к низу на коротких страницах и уезжает ниже на длинных.

---

## 9) История транзакций: модель

* `addTransaction()` добавляет запись в начало массива и сохраняет в `localStorage`.
* Поля транзакции: `id`, `amount`, `currency`, `type`, `method`, `status`, `date`.
* «Копировать ID» — показывает только кнопку (сам ID скрыт).

---

## 10) Как добавить новую вкладку/блок

1. Создать компонент блока в `src/pages/profile/blocks/<Group>/<Name>Block.jsx`.
2. Подключить его в странице вкладки.
3. Если нужны поля профиля — добавить в `normalizeUser()` и обновлять через `updateProfile()`.

---

## 11) TODO / дорожная карта

* Реальные платёжные провайдеры в «Терминал» + автоматическое добавление транзакций.
* Верификация email через провайдера (меняем `emailVerified` по колбэку).
* Таблица истории: фильтры/поиск/экспорт CSV/пагинация.
* Публичные/приватные промо, сезонные задачи.
* Лого провайдеров слотов + карточки провайдера.
* i18n (ru/en), форматирование валют по стране.

---

## 12) Что изменилось по сравнению с v0.6

### Архитектура и каркас

* **Новый sticky-footer**: `App.jsx` переписан на `min-vh-100` + `flex-grow-1`.
* **Подключён `index.css` в `main.jsx`** (ранее отсутствовало — из-за этого не работали стили GameCard).

### Header

* Добавлена кнопка **«Профиль»** и иконка-выход вместо текста «Выйти».
* **Переключатель тем** вынесен вправо; тема сохраняется между сессиями.

### Авторизация

* Разделены маршруты **`/login`** и **`/register`** (ранее `/auth`). Логика пока общая, тексты разные.

### Профиль

* Полностью переработан в формат "вкладка → блоки".
* Новое левое меню с **разделителями** и **бейджем баланса**; порядок вкладок обновлён.
* Добавлены новые вкладки: **Терминал**, **История транзакций**, **Верификация**, **Акции для игры**, **Сезон**, **История игр**.
* В «Персональные данные» добавлено много независимых блоков.
* **Индикация верификации**: жёлтый пункт меню при недостающих данных.
* **Аутентификатор**: визуальный статус (гусь 🪿 красный/зелёный), флаг `mfaEnabled` в профиле.

### Баланс и терминал

* Страница **Баланс** разбита на 3 блока, кнопки ведут в **Терминал**.
* **Терминал** — 2 блока (справа→налево): Депозит/Вывод, с рабочей логикой на мок-данных.

### История транзакций

* Введена модель транзакций в `AuthContext` + таблица отображения.
* Кнопка «Копировать ID» (ID не отображается текстом).

### Игровые карточки

* Переработаны под референс: картинка 16:9, блюр/зум на ховере, CTA поверх, снизу — название/провайдер.
* Убран верхний бейдж провайдера.

### Прочее

* Унифицировано форматирование валют (`Intl.NumberFormat('ru-RU', { style: 'currency', currency })`).
* Наведение порядка в `routes.jsx`: явный редирект index → `personal`, устранены дубли.

---

**Версия:** v0.7 (draft). После ревью — тэг и CHANGELOG.
