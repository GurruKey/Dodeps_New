import { getLocalDatabase } from '../../database/engine.js';

import {
  clonePromocodeRecord,
  listCanonicalPromocodeRecords,
  mapPromocodeRecordToRow,
} from './dataset.js';
import { ADMIN_PROMOCODES_TABLE } from './constants.js';

const tryGetLocalStorage = () => null;

const readFromStorage = () => listCanonicalPromocodeRecords();

const writeToStorage = (records) => {
  const db = getLocalDatabase();
  db.truncate(ADMIN_PROMOCODES_TABLE);

  if (!Array.isArray(records)) {
    return;
  }

  records.forEach((record) => {
    const row = mapPromocodeRecordToRow(clonePromocodeRecord(record));
    if (row) {
      db.upsert(ADMIN_PROMOCODES_TABLE, row);
    }
  });
};

export const storageAdapter = Object.freeze({
  tryGetLocalStorage,
  readFromStorage,
  writeToStorage,
});
