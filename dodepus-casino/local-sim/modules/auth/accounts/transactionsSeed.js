const COUNTRY_TO_CURRENCY = {
  AE: 'AED',
  AR: 'ARS',
  AU: 'AUD',
  CA: 'CAD',
  CH: 'CHF',
  DE: 'EUR',
  ES: 'EUR',
  GB: 'GBP',
  IN: 'INR',
  IT: 'EUR',
  JP: 'JPY',
  KR: 'KRW',
  PK: 'PKR',
  RU: 'USD',
  SE: 'SEK',
  SG: 'SGD',
  UK: 'GBP',
  US: 'USD',
  VN: 'VND',
};

const toTwoDigits = (value) => String(value).padStart(2, '0');

export const normalizeAmount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  return Math.round(numeric * 100) / 100;
};

const buildTransactionTimestamp = (accountIndex, entryIndex) => {
  const base = new Date(Date.UTC(2024, 0, 18 + (accountIndex % 7), 9, 30));
  base.setUTCDate(base.getUTCDate() - entryIndex);
  base.setUTCMinutes(base.getUTCMinutes() + accountIndex * 7 + entryIndex * 11);
  return base.toISOString();
};

const createTransactionId = (userId, entryIndex) => `${userId}-txn-${toTwoDigits(entryIndex + 1)}`;

export const createTransactionSeed = ({
  userId,
  currency,
  accountIndex,
  entryIndex,
  type,
  amount,
  status,
  method,
}) => ({
  id: createTransactionId(userId, entryIndex),
  userId,
  currency,
  date: buildTransactionTimestamp(accountIndex, entryIndex),
  status,
  type,
  method,
  amount: normalizeAmount(amount),
});

export const createTransactionsSeed = ({ userId, currency, accountIndex }) => {
  const baseAmount = 180 + accountIndex * 45;
  const depositAmount = baseAmount + 160;
  const withdrawAmount = Math.max(60, baseAmount - 70);
  const bonusAmount = 60 + (accountIndex % 5) * 25;
  const extraWithdrawAmount = Math.max(50, baseAmount - 120);

  const pendingStatus = accountIndex % 3 === 0 ? 'pending' : 'success';
  const failureStatus = accountIndex % 4 === 1 ? 'failed' : 'success';

  return [
    createTransactionSeed({
      userId,
      currency,
      accountIndex,
      entryIndex: 0,
      type: 'deposit',
      amount: depositAmount,
      status: 'success',
      method: 'card',
    }),
    createTransactionSeed({
      userId,
      currency,
      accountIndex,
      entryIndex: 1,
      type: 'withdraw',
      amount: withdrawAmount,
      status: pendingStatus,
      method: 'bank',
    }),
    createTransactionSeed({
      userId,
      currency,
      accountIndex,
      entryIndex: 2,
      type: 'deposit',
      amount: bonusAmount,
      status: 'success',
      method: accountIndex % 2 === 0 ? 'crypto' : 'other',
    }),
    createTransactionSeed({
      userId,
      currency,
      accountIndex,
      entryIndex: 3,
      type: 'withdraw',
      amount: extraWithdrawAmount,
      status: failureStatus,
      method: accountIndex % 2 === 0 ? 'card' : 'bank',
    }),
  ];
};

export const resolveCurrencyCode = (extras = {}) => {
  const rawCurrency = typeof extras.currency === 'string' ? extras.currency.trim() : '';
  if (rawCurrency) {
    return rawCurrency.toUpperCase();
  }

  return 'USD';
};

export const enrichAccountWithTransactions = (account, index) => {
  const extras = { ...(account.extras ?? {}) };

  if (extras.skipTransactionsSeed === true) {
    delete extras.skipTransactionsSeed;

    if (!Array.isArray(extras.transactions)) {
      extras.transactions = [];
    }

    return {
      ...account,
      extras,
    };
  }

  const currency = resolveCurrencyCode(extras);

  extras.currency = currency;

  if (!Array.isArray(extras.transactions) || extras.transactions.length === 0) {
    extras.transactions = createTransactionsSeed({
      userId: account.id,
      currency,
      accountIndex: index,
    });
  } else {
    extras.transactions = extras.transactions.map((txn, entryIndex) =>
      createTransactionSeed({
        userId: account.id,
        currency: txn.currency ? String(txn.currency).trim().toUpperCase() : currency,
        accountIndex: index,
        entryIndex,
        type: typeof txn.type === 'string' ? txn.type : 'deposit',
        amount: normalizeAmount(txn.amount),
        status: typeof txn.status === 'string' ? txn.status : 'success',
        method: typeof txn.method === 'string' ? txn.method : 'other',
      }),
    );
  }

  return {
    ...account,
    extras,
  };
};

export const enrichAccountsWithTransactions = (accounts = []) =>
  accounts.map((account, index) => enrichAccountWithTransactions(account, index));
