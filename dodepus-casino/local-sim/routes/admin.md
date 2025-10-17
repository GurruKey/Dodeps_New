# Local-sim Admin Routes

Документ описывает каноничные маршруты admin-local-sim. Все ответы собираются поверх сториджей `local-sim/modules/*/storage`. Примеры ниже используют актуальные значения из `local-sim/db`, а там, где данных нет, приведены заглушки со схемой ответа.

## Auth & Profiles

### GET /local-sim/admin/auth/users
Возвращает список предустановленных админских аккаунтов с профилями.

#### Response 200
```json
{
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "email": "owner@dodepus.dev",
      "phone": "+380441112233",
      "status": "active",
      "roles": ["owner", "admin", "user"],
      "roleLevel": 100,
      "createdAt": "2024-01-05T09:15:00.000Z",
      "profile": {
        "nickname": "grinch-owner",
        "firstName": "Олексій",
        "lastName": "Гринчук",
        "country": "UA",
        "city": "Kyiv",
        "balance": 12500.5,
        "casinoBalance": 3200.0,
        "currency": "UAH",
        "updatedAt": "2024-10-14T08:30:00.000Z"
      }
    }
  ]
}
```

### POST /local-sim/admin/auth/users/:id/profile
Обновляет `profiles` и `profile_extras` для администратора. Использует `modules/auth/profileExtras.saveExtras`.

#### Request
```json
{
  "firstName": "Олексій",
  "lastName": "Гринчук",
  "departments": ["executive"],
  "mfaEnabled": true
}
```

#### Response 200
```json
{
  "status": "ok",
  "savedAt": "2025-10-17T21:30:00.000Z"
}
```

## Promo

### GET /local-sim/admin/promocodes
Возвращает активные и архивные промокоды из `admin_promocodes`.

#### Response 200
```json
{
  "data": [
    {
      "id": "promo_seed_welcome_2025",
      "code": "WELCOME100",
      "status": "active",
      "typeId": "deposit-welcome",
      "title": "Welcome 100%",
      "used": 342,
      "limit": 1000,
      "params": {
        "audience": {
          "segments": ["newbies"],
          "countries": ["UA", "PL"],
          "newPlayersOnly": true
        },
        "limits": {
          "minDeposit": 10,
          "maxUsagePerClient": 1
        },
        "display": {
          "highlight": true,
          "showOnMain": true,
          "badge": "🎁"
        }
      },
      "startsAt": "2025-01-01T00:00:00.000Z",
      "endsAt": "2025-12-31T23:59:59.000Z"
    }
  ]
}
```

### POST /local-sim/admin/promocodes
Создаёт промокод через `createAdminPromocode`.

#### Request
```json
{
  "code": "WELCOME200",
  "title": "Дополнительный бонус",
  "typeId": "deposit-welcome",
  "limit": 500,
  "audience": {
    "segments": ["vip"],
    "countries": ["UA"]
  }
}
```

#### Response 201
```json
{
  "status": "created",
  "id": "promo_seed_welcome_2025-copy"
}
```

## Transactions

### GET /local-sim/admin/transactions
Возвращает транзакции профилей с join на email и никнейм.

#### Response 200
```json
{
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111-txn-01",
      "userId": "11111111-1111-4111-8111-111111111111",
      "clientEmail": "owner@dodepus.dev",
      "clientNickname": "grinch-owner",
      "amount": 25000.0,
      "currency": "UAH",
      "type": "deposit",
      "status": "success",
      "createdAt": "2024-10-09T09:10:00.000Z"
    }
  ]
}
```

## Verification

### GET /local-sim/admin/verification/requests
Возвращает заявки KYC, историю и загрузки в одном payload.

#### Response 200
```json
{
  "data": [
    {
      "id": "vr-ops-001",
      "userId": "22222222-2222-4222-8222-222222222222",
      "status": "in_review",
      "submittedAt": "2024-10-11T08:00:00.000Z",
      "reviewerId": "11111111-1111-4111-8111-111111111111",
      "history": [
        {
          "id": "vr-ops-001-h1",
          "action": "documents_received",
          "createdAt": "2024-10-11T08:05:00.000Z"
        }
      ],
      "uploads": [
        {
          "id": "vu-ops-001",
          "fileName": "ops_passport.pdf",
          "status": "approved",
          "uploadedAt": "2024-10-11T08:05:00.000Z"
        }
      ],
      "queue": {
        "id": "vq-ops-001",
        "documentType": "passport",
        "status": "processing",
        "priority": "high"
      }
    }
  ]
}
```

### POST /local-sim/admin/verification/requests/:id/decision
Фиксирует решение ревьюера и переносит запись из очереди.

#### Request
```json
{
  "status": "approved",
  "reviewerId": "11111111-1111-4111-8111-111111111111",
  "notes": "Всё в порядке"
}
```

#### Response 200
```json
{
  "status": "ok",
  "updatedAt": "2025-10-17T21:35:00.000Z"
}
```

## Rank

### GET /local-sim/admin/rank/levels
Возвращает уровни и награды, объединяя `rank_levels` и `rank_rewards`.

#### Response 200
```json
{
  "data": [
    {
      "id": "rank_level_seed_010",
      "level": 10,
      "slug": "vip-10",
      "label": "VIP 10",
      "reward": {
        "badgeColor": "#f3b200",
        "badgeEffect": "solid",
        "tagline": "Семь пятниц на неделе"
      }
    }
  ]
}
```

## Logs & Communications

### GET /local-sim/admin/logs
Возвращает admin logs вместе с контекстом.

#### Response 200
```json
{
  "data": [
    {
      "id": "admin_log_seed_0001",
      "adminId": "admin-0001",
      "adminName": "Алина Грин",
      "role": "superadmin",
      "section": "overview",
      "action": "Просмотрела сводку показателей",
      "createdAt": "2025-10-15T06:45:00.000Z"
    }
  ]
}
```

### GET /local-sim/admin/communications/threads
Возвращает треды с участниками и сообщениями.

На момент фиксации таблицы коммуникаций пустые, поэтому ниже приведён шаблон ответа.

```json
{
  "data": [
    {
      "id": "thread-placeholder",
      "channel": "operations",
      "title": "Операционный дайджест",
      "participants": [
        {
          "id": "participant-placeholder",
          "displayName": "Олексій",
          "joinedAt": "2025-10-10T08:00:00.000Z"
        }
      ],
      "messages": [
        {
          "id": "message-placeholder",
          "body": "Обновили лимиты на вывод",
          "createdAt": "2025-10-15T09:00:00.000Z"
        }
      ]
    }
  ]
}
```

## Healthcheck

### GET /local-sim/admin/health
Возвращает статусы всех таблиц и результат скрипта `local-sim/scripts/validateCanonicalDataset`.

#### Response 200
```json
{
  "status": "ok",
  "validatedAt": "2025-10-17T21:40:00.000Z",
  "datasets": {
    "authUsers": 4,
    "profiles": 4,
    "adminPromocodes": 5,
    "profileTransactions": 8,
    "verificationRequests": 3
  }
}
```

> Скрипт валидации запускается командой `npm run local-sim:validate` и проверяет ссылки `user_id`, `rank_level_id`, `thread_id`, `request_id` между таблицами.
