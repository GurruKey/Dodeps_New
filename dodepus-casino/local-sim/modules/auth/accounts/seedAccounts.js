import { enrichAccountsWithTransactions } from './transactionsSeed';
import { OWNER_PRESET_ACCOUNT } from './presets/ownerAccount';

const BASE_ACCOUNTS = Object.freeze([]);

const BUILTIN_ACCOUNTS = Object.freeze([OWNER_PRESET_ACCOUNT]);

export const PRESET_ACCOUNTS = Object.freeze(
  enrichAccountsWithTransactions([...BASE_ACCOUNTS, ...BUILTIN_ACCOUNTS]),
);
