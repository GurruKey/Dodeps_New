# Local-sim Auth Routes

## POST /local-sim/auth/sign-up/email
Регистрация по email. Возвращает нового пользователя и сессию из local-sim.

### Request
```json
{
  "email": "owner@example.com",
  "password": "Password1"
}
```

### Response 200
```json
{
  "user": {
    "id": "usr_xxxxxxxx",
    "email": "owner@example.com",
    "phone": "",
    "createdAt": "2025-10-18T12:00:00.000Z",
    "roles": ["owner", "admin", "user"],
    "role": "owner",
    "isAdmin": true,
    "app_metadata": {
      "provider": "email",
      "role": "owner",
      "roles": ["owner", "admin", "user"],
      "isAdmin": true
    },
    "user_metadata": {
      "role": "owner",
      "roles": ["owner", "admin", "user"],
      "isAdmin": true
    },
    "emailVerified": false,
    "mfaEnabled": false,
    "balance": 0,
    "casinoBalance": 0,
    "currency": "USD"
  },
  "session": {
    "userId": "usr_xxxxxxxx",
    "accessToken": "local_token_xxxxxxxxxxxx",
    "token_type": "bearer",
    "created_at": "2025-10-18T12:00:00.000Z"
  },
  "needsEmailConfirm": false
}
```

## POST /local-sim/auth/sign-up/phone
Регистрация по телефону. Аналогично email-версии, но возвращает флаг `needsSmsVerify`.

### Request
```json
{
  "phone": "+380501234567",
  "password": "Password1"
}
```

### Response 200
```json
{
  "user": {
    "id": "usr_xxxxxxxx",
    "email": "",
    "phone": "+380501234567",
    "createdAt": "2025-10-18T12:00:00.000Z",
    "roles": ["owner", "admin", "user"],
    "role": "owner",
    "isAdmin": true,
    "app_metadata": {
      "provider": "phone",
      "role": "owner",
      "roles": ["owner", "admin", "user"],
      "isAdmin": true
    },
    "user_metadata": {
      "role": "owner",
      "roles": ["owner", "admin", "user"],
      "isAdmin": true
    },
    "emailVerified": false,
    "mfaEnabled": false,
    "balance": 0,
    "casinoBalance": 0,
    "currency": "USD"
  },
  "session": {
    "userId": "usr_xxxxxxxx",
    "accessToken": "local_token_xxxxxxxxxxxx",
    "token_type": "bearer",
    "created_at": "2025-10-18T12:00:00.000Z"
  },
  "needsSmsVerify": false
}
```
