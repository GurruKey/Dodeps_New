# Local SIM Database

В local-sim добавлена SQL-подобная прослойка, которая хранит данные проекта в `localStorage` и позволяет тестировать сайт без внешнего бэкенда.

## Что внутри

- `local-sim/database/engine.js` — движок с базовыми операциями (`select`, `upsert`, `replaceWhere`, `execute`).
- `local-sim/database/schema.js` — схема таблиц: `auth_users`, `profiles`, `verification_requests`, `verification_uploads`, `admin_logs`.
- `local-sim/database/seed.js` — наполнение таблиц предустановленными данными из сидов авторизации и верификации.

## Как это работает

1. При запуске мок-авторизации (`ensureSeededAuthStorage`) автоматически вызывается `applyLocalDatabaseSeed`, который пересоздаёт базу с актуальными данными.
2. Любые операции с пользователями проходят через `auth_users`:
   - чтение — `getLocalDatabase().select('auth_users')`;
   - запись — `writeUsers` обновляет и localStorage, и таблицу.
3. Профили и заявки верификации берутся из базы через `loadExtras`:
   - профиль (`profiles`) и связанные заявки (`verification_requests`, `verification_uploads`) объединяются в единый snapshot;
   - сохранение (`saveExtras`) синхронизирует все таблицы и оставляет копию в legacy `localStorage`.

## Мини-SQL

Метод `execute(sql, params)` поддерживает запросы:

- `SELECT * FROM table` и `SELECT * FROM table WHERE column = ?`
- `INSERT INTO table (col1, col2) VALUES (?, ?)`
- `UPDATE table SET col1 = ?, col2 = ? WHERE id = ?`
- `DELETE FROM table` и `DELETE FROM table WHERE column = ?`

Для сложных сценариев используйте прямые методы (`select`, `upsert`, `replaceWhere`).

## Как проверить

```bash
npm run dev
# в браузере откройте консоль и выполните:
import { getLocalDatabase } from './local-sim/database/engine';
const db = getLocalDatabase();
db.select('auth_users');
```

Все запросы интерфейса (авторизация, профиль, админ-верификация) теперь читают данные из этой базы, поэтому сайт можно прогонять полностью офлайн.
