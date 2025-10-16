# Migration Notes

## 2025-10-16 — Admin promocodes table
- **admin_promocodes**
  - Columns: `id text PK`, `code text not null unique`, `type_id text not null`, `title text not null`,
    `reward text`, `status text not null`, `limit integer`, `used integer not null`,
    `wager numeric(10,2)`, `cashout_cap numeric(12,2)`, `notes text`, `params jsonb not null`,
    `starts_at timestamptz`, `ends_at timestamptz`, `created_at timestamptz`, `updated_at timestamptz`,
    `activations jsonb not null`
  - Indexes: primary key on `id`, unique index on `code`, btree index on (`status`, `ends_at` DESC),
    btree index on (`type_id`, `status`)

**Parity заметки (admin promocodes):**
- JSON `admin_promocodes.json` хранит canonical набор кодов, который поднимается сидером local-sim.
- `modules/promo/storage` читает таблицу `admin_promocodes` через локальную БД и мапит snake_case → camelCase.
- Поле `activations` остаётся jsonb-массивом; при переходе в SQL возможен вынос в отдельную таблицу `admin_promocode_activations`.

## 2025-10-16 — Admin roles & permissions tables
- **admin_roles**
  - Columns: `id text PK`, `role_group text not null`, `level integer`, `is_admin boolean not null`,
    `name text not null`, `description text`, `sort_order integer not null`,
    `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Indexes: primary key on `id`, btree index on (`role_group`, `sort_order`)
- **admin_permissions**
  - Columns: `id text PK`, `label text not null`, `description text`, `sort_order integer not null`,
    `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Indexes: primary key on `id`, btree index on `sort_order`
- **admin_role_permissions**
  - Columns: `id text PK`, `role_id text not null`, `permission_id text not null`,
    `allowed boolean not null`, `sort_order integer not null`, `created_at timestamptz not null`,
    `updated_at timestamptz not null`
  - Constraints: foreign key `role_id` → `admin_roles(id)` ON DELETE CASCADE,
    foreign key `permission_id` → `admin_permissions(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, unique index on (`role_id`, `permission_id`)

**Parity заметки (admin access):**
- JSONы `admin_roles.json`, `admin_permissions.json`, `admin_role_permissions.json` описывают canonical набор ролей и доступов.
- Модуль `modules/access/roles` читает таблицы из локальной БД и мапит snake_case → camelCase для фронта.
- При отсутствии записей local-sim использует встроенный fallback, но canonical данные задаются через JSON и сидер.

## 2025-10-16 — Admin logs table
- **admin_logs**
  - Columns: `id text PK`, `admin_id text not null`, `admin_name text not null`, `role text not null`,
    `section text not null`, `action text not null`, `created_at timestamptz`,
    `context text`, `metadata jsonb`
  - Indexes: primary key on `id`, btree index on (`section`, `created_at` DESC),
    btree index on (`role`, `created_at` DESC)

**Parity заметки (admin logs):**
- JSON `admin_logs.json` задаёт canonical данные для local-sim и будущей SQL-таблицы.
- Модуль `modules/logs/api` мапит snake_case колонки в camelCase поля для фронтенда.
- Динамические логи транзакций продолжают дополнять выдачу поверх canonical набора.

## 2025-10-16 — Communications tables
- **communication_threads**
  - Columns: `id uuid PK`, `channel text not null`, `title text not null`, `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Indexes: primary key on `id`, btree index on `channel`
- **communication_thread_participants**
  - Columns: `id uuid PK`, `thread_id uuid not null`, `display_name text not null`, `joined_at timestamptz not null`
  - Constraints: foreign key `thread_id` → `communication_threads(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, unique index on (`thread_id`, `display_name`)
- **communication_messages**
  - Columns: `id uuid PK`, `thread_id uuid not null`, `participant_id uuid not null`, `body text not null`, `created_at timestamptz not null`
  - Constraints: foreign key `thread_id` → `communication_threads(id)` ON DELETE CASCADE, foreign key `participant_id` → `communication_thread_participants(id)`
  - Indexes: primary key on `id`, btree index on (`thread_id`, `created_at DESC`)

**Parity заметки:**
- JSON-файлы `local-sim/db` отражают будущие таблицы 1в1 по именам и полям.
- В local-sim формат сообщений мапится на camelCase (`createdAt`), но оригинальные поля в JSON остаются snake_case для SQL.

## 2025-10-16 — Profile transactions table
- **profile_transactions**
  - Columns: `id text PK`, `user_id text not null`, `amount numeric(12,2) not null`, `currency text not null`,
    `transaction_type text not null`, `status text not null`, `method text not null`,
    `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Constraints: foreign key `user_id` → `auth_users(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, btree index on (`user_id`, `created_at` DESC)

**Parity заметки (transactions):**
- JSON `profile_transactions.json` задаёт canonical-данные для local-sim и будущего SQL.
- Модуль `modules/transactions/api` мапит snake_case поля (`created_at`, `transaction_type`) в camelCase для фронта.

## 2025-10-16 — Verification tables
- **verification_requests**
  - Columns: `id text PK`, `user_id text not null`, `status text not null`, `submitted_at timestamptz`,
    `updated_at timestamptz`, `reviewed_at timestamptz`, `reviewer_id text`, `reviewer_name text`,
    `reviewer_role text`, `notes text`, `completed_fields jsonb not null`, `requested_fields jsonb not null`,
    `cleared_fields jsonb not null`, `history jsonb`, `metadata jsonb`
  - Constraints: foreign key `user_id` → `auth_users(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, btree index on (`user_id`, `updated_at` DESC)
- **verification_uploads**
  - Columns: `id text PK`, `user_id text not null`, `request_id text`, `file_name text`, `file_type text not null`,
    `file_url text`, `status text not null`, `uploaded_at timestamptz`
  - Constraints: foreign key `user_id` → `auth_users(id)` ON DELETE CASCADE,
    foreign key `request_id` → `verification_requests(id)` ON DELETE SET NULL
  - Indexes: primary key on `id`, btree index on (`user_id`, `uploaded_at` DESC)
- **verification_queue**
  - Columns: `id text PK`, `request_id text`, `user_id text not null`, `document_type text not null`,
    `status text not null`, `submitted_at timestamptz`, `priority text not null`
  - Constraints: foreign key `request_id` → `verification_requests(id)` ON DELETE SET NULL,
    foreign key `user_id` → `auth_users(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, btree index on (`status`, `submitted_at` DESC)

**Parity заметки (verification):**
- JSONы `verification_requests.json`, `verification_uploads.json`, `verification_queue.json` отражают будущие таблицы.
- `profileExtras` мапит snake_case данные в camelCase для фронта и обратно при сохранении.
- Очередь (`modules/verification/queue`) читает таблицу `verification_queue` и форматирует `submitted_at` для UI.
