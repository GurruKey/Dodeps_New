# profileExtras.js

Описание вспомогательных функций для работы с локальными данными профиля:
- `pickExtras` нормализует объект с данными, приводя значения к ожидаемым типам.
- `loadExtras` собирает профиль из SQL-эмулятора (`profiles`, `profile_transactions`, `verification_requests`, `verification_uploads`) и при отсутствии записей подтягивает legacy `localStorage`.
- `saveExtras` синхронизирует профиль во всех таблицах SQL-движка и дублирует snapshot в `localStorage` для обратной совместимости.
Эти функции обеспечивают единый слой между фронтендом и локальной БД.
