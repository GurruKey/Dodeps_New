import { TABLE_PRIMARY_KEYS } from '../modules/shared/index.js';

const freezeTableConfig = (entries) =>
  Object.freeze(
    Object.fromEntries(
      entries.map(([tableName, primaryKey]) => [tableName, Object.freeze({ primaryKey })]),
    ),
  );

export const DEFAULT_LOCAL_DB_SCHEMA = Object.freeze({
  version: 1,
  tables: freezeTableConfig(Object.entries(TABLE_PRIMARY_KEYS)),
});
