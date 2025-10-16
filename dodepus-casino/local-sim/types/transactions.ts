export type TransactionStatus = 'pending' | 'failed' | 'success' | string;
export type TransactionType = 'deposit' | 'withdraw' | 'bonus' | string;
export type TransactionMethod = 'card' | 'bank' | 'crypto' | 'other' | string;

export interface ProfileTransactionRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  method: TransactionMethod;
  created_at: string;
  updated_at: string;
}

export type ProfileTransactionRecord = ProfileTransactionRow;

export interface ProfileTransactionEntry {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  method: TransactionMethod;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TransactionsSnapshot {
  records: ReadonlyArray<ProfileTransactionEntry>;
  byId: Map<string, ProfileTransactionEntry>;
  byUserId: Map<string, ReadonlyArray<ProfileTransactionEntry>>;
}
