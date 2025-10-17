# Migration Notes

## 2025-10-17 — Dataset validation & admin routes
- Добавлен скрипт `local-sim/scripts/validateCanonicalDataset.js`, который валидирует referential integrity (`user_id`, `rank_level_id`,
  `thread_id`, `request_id`) между JSON-таблицами и проверяет уникальность `id`/`code` перед переносом в SQL.
- Создан npm-скрипт `npm run local-sim:validate`, чтобы быстро запускать проверку каноничного датасета перед миграциями.
- Описаны admin-маршруты в `local-sim/routes/admin.md`, фиксирующие контракт локального API для auth, promo, transactions,
  verification, rank, logs и communications перед реализацией SQL.

## 2025-10-17 — Auth users & profiles tables
- **auth_users**
  - Columns: `id text PK`, `email text not null`, `phone text`, `password text not null`,
    `created_at timestamptz`, `confirmed_at timestamptz`, `email_confirmed_at timestamptz`,
    `phone_confirmed_at timestamptz`, `last_sign_in_at timestamptz`, `status text not null`,
    `role text`, `role_level integer`, `roles text[]`, `app_metadata jsonb not null`,
    `user_metadata jsonb not null`
  - Indexes: primary key on `id`, unique index on `lower(email)` NULLS NOT DISTINCT,
    btree index on `phone`
- **profiles**
  - Columns: `id text PK`, `nickname text`, `first_name text`, `last_name text`, `gender text`,
    `dob date`, `phone text`, `country text`, `city text`, `address text`,
    `email_verified boolean not null`, `mfa_enabled boolean not null`,
    `balance numeric(12,2) not null`, `casino_balance numeric(12,2) not null`,
    `currency text not null`, `updated_at timestamptz`
  - Indexes: primary key on `id`

**Parity заметки (clients/auth):**
- Таблицы `auth_users` и `profiles` держат canonical пользователей и их профильные поля в local-sim; демо-записей нет.
- JSON-файлы `db/auth_users.json` и `db/profiles.json` содержат четыре предустановленных аккаунта (owner, ops admin, support, vip manager) и синхронизированы с профилями, чтобы local-sim хранил точные email/phone/role значения перед SQL.
- Storage helper `modules/auth/storage/authUsers` нормализует строки `auth_users`, строит snapshot с индексами `byId`/`byEmail`/`byPhone` и заменяет прямое чтение БД в `modules/auth/api`.
- Storage helper `modules/clients/storage/clientSnapshot` переиспользует snapshot auth и дополняет его профилями, фиксируя ISO-таймстемпы и индексы `byId`/`byEmail`/`byPhone`/`profilesById`.
- `modules/clients/api` читает админских клиентов только через storage индекс и объединяет их с profile extras.
- Типы и структура вынесены в `local-sim/types/clients.ts` и `local-sim/types/auth.ts` для подготовки будущих SQL-схем.
- TypeScript-описания `local-sim/types/auth.ts` и `local-sim/types/clients.ts` фиксируют snake_case строки JSON и нормализованные snapshot-записи, облегчая генерацию SQL-схем.
- Дополнительно зафиксированы структуры promo/transactions/verification/rank в `local-sim/types/*.ts`: описаны snake_case строки таблиц, нормализованные записи с `raw`/history и наборы params для будущих миграций.
- Типы промокодов теперь включают repeat/audience/limits/display параметры, а транзакции — shape динамических логов админ-панели.
- Табличные константы для auth/profiles/verification/transactions теперь экспортируются из модулей и переиспользуются сидером локальной БД, чтобы исключить расхождения имён перед миграциями.

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
- Storage helper `modules/promo/storage/promocodes` читает таблицу `admin_promocodes` через локальную БД, мапит snake_case → camelCase структуры и формирует canonical snapshot.
- `modules/promo/storage/index` используется core-репозиторием и API как единая точка доступа к промокодам и точка записи обратно в локальную БД.
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
- Storage helper `modules/access/storage/accessSnapshot` читает локальную БД, нормализует роли/права и строит матрицу разрешений, которой пользуются все модули доступа.
- `modules/access/roles` переиспользует storage snapshot, отдаёт готовый набор и предоставляет хелперы для фронта; fallback остаётся только на случай пустой БД.

## 2025-10-16 — Rank levels & rewards tables
- **rank_levels**
  - Columns: `id text PK`, `level integer not null`, `slug text not null`, `label text not null`,
    `short_label text not null`, `group text not null`, `tier integer not null`,
    `deposit_step integer not null`, `total_deposit integer not null`, `sort_order integer not null`,
    `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Indexes: primary key on `id`, unique index on `level`, unique index on `slug`
- **rank_rewards**
  - Columns: `id text PK`, `rank_level_id text not null`, `level integer not null`, `label text not null`,
    `badge_color text not null`, `badge_color_secondary text not null`, `badge_color_tertiary text not null`,
    `badge_text_color text not null`, `badge_effect text not null`, `badge_effect_speed numeric(4,1) not null`,
    `tagline text not null`, `description text not null`, `purpose text not null`,
    `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Constraints: foreign key `rank_level_id` → `rank_levels(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, unique index on `rank_level_id`, unique index on `level`

**Parity заметки (rank):**
- JSONы `rank_levels.json` и `rank_rewards.json` задают canonical набор VIP-уровней и базовых наград.
- Storage helper `modules/rank/storage/rankDataset` читает таблицы через локальную БД, мапит snake_case поля в camelCase структуры и отдаёт snapshot для остальных модулей рангов.
- Хранилище `modules/rank/storage` использует dataset-хелпер как дефолт, а оверрайды (localStorage) применяются поверх него.

## 2025-10-16 — Admin logs table
- **admin_logs**
  - Columns: `id text PK`, `admin_id text not null`, `admin_name text not null`, `role text not null`,
    `section text not null`, `action text not null`, `created_at timestamptz`,
    `context text`, `metadata jsonb`
  - Indexes: primary key on `id`, btree index on (`section`, `created_at` DESC),
    btree index on (`role`, `created_at` DESC)

**Parity заметки (admin logs):**
- JSON `admin_logs.json` задаёт canonical данные для local-sim и будущей SQL-таблицы.
- Storage helper `modules/logs/storage/adminLogs` нормализует строки таблицы, приводит snake_case → camelCase, строит snapshot индексы `byId`/`byAdminId`/`bySection`.
- Модуль `modules/logs/api` использует storage helper как источник истины, а динамические логи транзакций продолжают дополнять выдачу поверх canonical набора.
- Типы `local-sim/types/logs.ts` фиксируют и строки таблицы, и нормализованные записи snapshot для дальнейшей генерации SQL-типов.

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
- Демо-события удалены: массивы по умолчанию пустые и ожидают реальных записей после подтверждения схемы.
- В local-sim формат сообщений мапится на camelCase (`createdAt`), но оригинальные поля в JSON остаются snake_case для SQL.
- Snapshot `modules/communications/storage/communicationSnapshot` читает таблицы коммуникаций из локальной БД, сортирует
  участников по `joined_at`, а сообщения — по `created_at DESC`, и используется модулем `threads` как канонический источник
  данных.

## 2025-10-16 — Profile transactions table
- **profile_transactions**
  - Columns: `id text PK`, `user_id text not null`, `amount numeric(12,2) not null`, `currency text not null`,
    `transaction_type text not null`, `status text not null`, `method text not null`,
    `created_at timestamptz not null`, `updated_at timestamptz not null`
  - Constraints: foreign key `user_id` → `auth_users(id)` ON DELETE CASCADE
  - Indexes: primary key on `id`, btree index on (`user_id`, `created_at` DESC)

**Parity заметки (transactions):**
- JSON `profile_transactions.json` содержит реальные записи для предустановленных админских аккаунтов (депозиты/выводы/бонусы), а сидеры могут дополнять данные поверх них.
- Storage helper `modules/transactions/storage/transactionRecords` нормализует строки таблицы, сортирует по `created_at DESC`, строит индексы `byId`/`byUserId` и выступает каноническим источником для API.
- Модуль `modules/transactions/api` читает snapshot storage-хелпера, добавляет почту/никнейм клиента и мапит snake_case поля (`created_at`, `transaction_type`) в camelCase для фронта.

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

- **Parity заметки (verification):**
- JSONы `verification_requests.json`, `verification_uploads.json`, `verification_queue.json` содержат актуальные заявки и загрузки для предустановленных аккаунтов (owner/ops/vip/support) и выступают каноничными записями local-sim.
- Storage helper `modules/verification/storage/verificationDataset` мапит таблицы `verification_requests`, `verification_uploads`, `verification_queue` в canonical структуры, строит snapshot с индексами `byId`/`byRequestId`/`byUserId` и используется `profileExtras` и админ-модулями.
- `profileExtras` мапит snake_case данные в camelCase для фронта и обратно при сохранении через storage-хелпер.
- Очередь (`modules/verification/queue`) читает snapshot storage-хелпера, форматирует `submitted_at` для UI и переиспользует canonical данные.
