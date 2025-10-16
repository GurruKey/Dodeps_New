export type TransactionStatus = 'pending' | 'failed' | 'success' | string;
export type TransactionType = 'deposit' | 'withdraw' | 'bonus' | string;
export type TransactionMethod = 'card' | 'bank' | 'crypto' | 'other' | string;

export interface ProfileTransactionRecord {
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
