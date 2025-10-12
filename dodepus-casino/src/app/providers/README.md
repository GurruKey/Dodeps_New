# App providers

`src/app/providers` содержит общие провайдеры приложения:

- `auth/` — контекст аутентификации, экспортирует `AuthProvider` и `useAuth`.
- `theme/` — переключатель темы с хранилищем в localStorage, экспортирует `ThemeProvider` и `useTheme`.
- `AppProviders.jsx` — композиция провайдеров (тема → auth) для подключения в `src/main.jsx`.
- `index.js` — единая точка импорта (`import { useAuth } from '.../app/providers';`).

Такой формат позволяет подключать провайдеры из одного места и сохраняет читаемость структуры `src/app`.
