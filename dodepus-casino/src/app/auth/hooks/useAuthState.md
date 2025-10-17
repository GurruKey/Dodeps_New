# hooks/useAuthState.js

Пользовательский хук, который поднимает состояния `session`, `user` и `loading` и делегирует инициализацию `initAuthEffect` из barrel `local-sim/modules/auth/index.js`.
Хук возвращает ссылки на стейты и сеттеры, чтобы другие фабрики действий могли обновлять авторизацию.
