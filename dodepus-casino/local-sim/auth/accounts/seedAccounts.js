import { enrichAccountsWithTransactions } from './transactionsSeed';

const BASE_ACCOUNTS = Object.freeze([]);

export const PRESET_ACCOUNTS = Object.freeze(enrichAccountsWithTransactions([...BASE_ACCOUNTS]));
