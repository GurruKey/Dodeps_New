# context/AuthProvider.jsx

Компонент-обертка собирает все фабрики и предоставляет итоговый контекст:
- состояние инициализируется через `useAuthState`;
- `createAuthActions` добавляет методы входа/выхода;
- `createUserProfileActions` отвечает за пользовательские данные;
- `createAdminPanelActions` добавляет проверки доступа к админке.
