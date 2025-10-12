import { DEFAULT_LOCAL_DB_SCHEMA } from './schema.js';
import { getBrowserStorage, safeParse, safeStringify } from './storage.js';

const STORAGE_KEY = 'dodepus_local_sql_db_v1';

const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // fallthrough
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const normalizePrimaryKey = (tableConfig) => {
  if (!tableConfig || typeof tableConfig !== 'object') {
    return 'id';
  }
  const key = tableConfig.primaryKey;
  return typeof key === 'string' && key.trim() ? key.trim() : 'id';
};

const ensureTableState = (state, tableName, schema) => {
  if (!state.tables) {
    state.tables = {};
  }

  if (!state.tables[tableName] || typeof state.tables[tableName] !== 'object') {
    state.tables[tableName] = { rows: [], primaryKey: normalizePrimaryKey(schema.tables?.[tableName]) };
    return state.tables[tableName];
  }

  const table = state.tables[tableName];
  if (!Array.isArray(table.rows)) {
    table.rows = [];
  }
  table.primaryKey = normalizePrimaryKey(schema.tables?.[tableName]) || table.primaryKey || 'id';
  return table;
};

const ensureSchemaState = (state, schema) => {
  const nextState = state && typeof state === 'object' ? state : {};
  nextState.version = schema.version;
  nextState.tables = nextState.tables && typeof nextState.tables === 'object' ? nextState.tables : {};

  Object.keys(schema.tables || {}).forEach((tableName) => {
    ensureTableState(nextState, tableName, schema);
  });

  return nextState;
};

const SELECT_RE = /^SELECT\s+\*\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?)?\s*$/i;
const DELETE_RE = /^DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?)?\s*$/i;
const INSERT_RE = /^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*$/i;
const UPDATE_RE = /^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?\s*$/i;

const splitColumns = (value) =>
  value
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean);

const zipObject = (keys, values) => {
  const result = {};
  keys.forEach((key, idx) => {
    result[key] = values[idx];
  });
  return result;
};

class LocalSqlDatabase {
  constructor({ storageKey = STORAGE_KEY, schema = DEFAULT_LOCAL_DB_SCHEMA } = {}) {
    this.storageKey = storageKey;
    this.schema = schema;
    this.storage = getBrowserStorage();
    this.state = ensureSchemaState(this.readState(), this.schema);
    this.persist();
  }

  readState() {
    const raw = this.storage.getItem(this.storageKey);
    const parsed = safeParse(raw, null);
    if (!parsed || typeof parsed !== 'object') {
      return { version: this.schema.version, tables: {} };
    }
    return parsed;
  }

  persist() {
    try {
      this.storage.setItem(this.storageKey, safeStringify(this.state));
    } catch (err) {
      console.warn('[local-sim] Не удалось сохранить состояние локальной БД', err);
    }
  }

  reset(newState = null) {
    if (newState && typeof newState === 'object') {
      this.state = ensureSchemaState(cloneDeep(newState), this.schema);
    } else {
      this.state = ensureSchemaState({ version: this.schema.version, tables: {} }, this.schema);
    }
    this.persist();
  }

  ensureTable(tableName) {
    return ensureTableState(this.state, tableName, this.schema);
  }

  getTable(tableName) {
    const table = this.state.tables?.[tableName];
    if (!table) {
      return this.ensureTable(tableName);
    }
    if (!Array.isArray(table.rows)) {
      table.rows = [];
    }
    if (!table.primaryKey) {
      table.primaryKey = normalizePrimaryKey(this.schema.tables?.[tableName]);
    }
    return table;
  }

  select(tableName, predicate = null) {
    const table = this.getTable(tableName);
    const rows = table.rows || [];
    const filter = typeof predicate === 'function' ? predicate : () => true;
    return rows.filter((row) => {
      try {
        return filter(cloneDeep(row));
      } catch {
        return false;
      }
    }).map((row) => cloneDeep(row));
  }

  findById(tableName, id) {
    if (id === undefined || id === null) {
      return null;
    }
    const table = this.getTable(tableName);
    const pk = table.primaryKey || 'id';
    const rows = table.rows || [];
    const match = rows.find((row) => row && row[pk] === id);
    return match ? cloneDeep(match) : null;
  }

  insert(tableName, row) {
    if (!row || typeof row !== 'object') {
      throw new Error('Row must be an object');
    }
    const table = this.getTable(tableName);
    const pk = table.primaryKey || 'id';
    if (!(pk in row)) {
      throw new Error(`Row must include primary key "${pk}"`);
    }
    const rows = table.rows || [];
    const exists = rows.some((existing) => existing && existing[pk] === row[pk]);
    if (exists) {
      throw new Error(`Duplicate primary key value for table ${tableName}`);
    }
    const cloned = cloneDeep(row);
    rows.push(cloned);
    table.rows = rows;
    this.persist();
    return cloneDeep(cloned);
  }

  upsert(tableName, row) {
    if (!row || typeof row !== 'object') {
      throw new Error('Row must be an object');
    }
    const table = this.getTable(tableName);
    const pk = table.primaryKey || 'id';
    if (!(pk in row)) {
      throw new Error(`Row must include primary key "${pk}"`);
    }

    const rows = table.rows || [];
    const index = rows.findIndex((existing) => existing && existing[pk] === row[pk]);
    const cloned = cloneDeep(row);
    if (index === -1) {
      rows.push(cloned);
    } else {
      rows[index] = { ...rows[index], ...cloned };
    }
    table.rows = rows;
    this.persist();
    return cloneDeep(cloned);
  }

  updateWhere(tableName, predicate, updater) {
    if (typeof predicate !== 'function' || typeof updater !== 'function') {
      throw new Error('updateWhere expects predicate and updater functions');
    }
    const table = this.getTable(tableName);
    const pk = table.primaryKey || 'id';
    let changed = false;
    const nextRows = table.rows.map((row) => {
      if (!predicate(cloneDeep(row))) {
        return row;
      }
      const draft = cloneDeep(row);
      const updated = updater(draft) ?? draft;
      if (!updated || typeof updated !== 'object') {
        return row;
      }
      if (!(pk in updated)) {
        updated[pk] = row[pk];
      }
      if (updated !== row) {
        changed = true;
      }
      return cloneDeep(updated);
    });
    if (changed) {
      table.rows = nextRows;
      this.persist();
    }
    return changed;
  }

  deleteWhere(tableName, predicate) {
    if (typeof predicate !== 'function') {
      throw new Error('deleteWhere expects a predicate function');
    }
    const table = this.getTable(tableName);
    const rows = table.rows || [];
    const nextRows = rows.filter((row) => !predicate(cloneDeep(row)));
    const changed = nextRows.length !== rows.length;
    if (changed) {
      table.rows = nextRows;
      this.persist();
    }
    return changed;
  }

  replaceWhere(tableName, predicate, nextRows = []) {
    const table = this.getTable(tableName);
    const pk = table.primaryKey || 'id';
    const preserved = table.rows.filter((row) => !predicate(cloneDeep(row)));
    const preparedNextRows = Array.isArray(nextRows)
      ? nextRows
          .filter((row) => row && typeof row === 'object')
          .map((row) => {
            if (!(pk in row)) {
              throw new Error(`Row for table ${tableName} must include primary key "${pk}"`);
            }
            return cloneDeep(row);
          })
      : [];
    table.rows = preserved.concat(preparedNextRows);
    this.persist();
    return cloneDeep(preparedNextRows);
  }

  truncate(tableName) {
    const table = this.getTable(tableName);
    table.rows = [];
    this.persist();
  }

  execute(sql, params = []) {
    if (typeof sql !== 'string') {
      throw new Error('SQL query must be a string');
    }
    const trimmed = sql.trim();
    if (!trimmed) {
      return [];
    }

    const selectMatch = trimmed.match(SELECT_RE);
    if (selectMatch) {
      const [, tableName, column] = selectMatch;
      if (!column) {
        return this.select(tableName);
      }
      const value = params[0];
      return this.select(tableName, (row) => row[column] === value);
    }

    const deleteMatch = trimmed.match(DELETE_RE);
    if (deleteMatch) {
      const [, tableName, column] = deleteMatch;
      if (!column) {
        this.truncate(tableName);
        return [];
      }
      const value = params[0];
      this.deleteWhere(tableName, (row) => row[column] === value);
      return [];
    }

    const insertMatch = trimmed.match(INSERT_RE);
    if (insertMatch) {
      const [, tableName, columnsChunk, valuesChunk] = insertMatch;
      const columns = splitColumns(columnsChunk);
      const placeholders = splitColumns(valuesChunk);
      if (placeholders.length !== columns.length) {
        throw new Error('Количество значений не совпадает с количеством столбцов');
      }
      const values = placeholders.map((placeholder, idx) => {
        if (placeholder !== '?') {
          throw new Error('Поддерживаются только плейсхолдеры ? в VALUES');
        }
        return params[idx];
      });
      const record = zipObject(columns, values);
      this.upsert(tableName, record);
      return [cloneDeep(record)];
    }

    const updateMatch = trimmed.match(UPDATE_RE);
    if (updateMatch) {
      const [, tableName, assignmentsChunk, whereColumn] = updateMatch;
      const assignments = splitColumns(assignmentsChunk).map((assignment) => assignment.split('='));
      const values = params.slice(0, assignments.length);
      const whereValue = params[assignments.length];
      const updates = zipObject(
        assignments.map(([column]) => column.trim()),
        values,
      );
      this.updateWhere(tableName, (row) => row[whereColumn] === whereValue, (row) => ({
        ...row,
        ...updates,
      }));
      return [];
    }

    throw new Error(`Unsupported SQL query: ${sql}`);
  }
}

let cachedDatabase = null;

export const getLocalDatabase = (options = {}) => {
  if (!cachedDatabase) {
    cachedDatabase = new LocalSqlDatabase(options);
  }
  return cachedDatabase;
};

export const resetLocalDatabase = (seedState = null, options = {}) => {
  const db = getLocalDatabase(options);
  db.reset(seedState);
  return db;
};
