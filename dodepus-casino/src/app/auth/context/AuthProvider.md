# providers/auth/AuthProvider.jsx

Компонент-обертка собирает все фабрики и предоставляет итоговый контекст
через barrel `src/app/auth/index.js`:
- состояние инициализируется через `useAuthState`;
- `createAuthActions` добавляет методы входа/выхода;
- `createUserProfileActions` отвечает за пользовательские данные;
- `createAdminPanelActions` добавляет проверки доступа к админке.

Файл перенесён в `src/app/providers/auth` и доступен через единый вход `src/app/providers`.
