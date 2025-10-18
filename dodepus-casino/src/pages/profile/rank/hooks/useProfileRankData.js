import { useMemo } from 'react';
import { useAuth } from '@/app/providers';
import { getProfileRankData } from '@local-sim/modules/rank/index.js';

const buildTransactionsSignature = (transactions) =>
  (Array.isArray(transactions) ? transactions : [])
    .map((txn) => {
      if (!txn || typeof txn !== 'object') {
        return '';
      }
      return txn.id || `${txn.type}:${txn.amount}:${txn.date}`;
    })
    .join('|');

export function useProfileRankData() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const balance = user?.balance ?? null;
  const casinoBalance = user?.casinoBalance ?? null;
  const transactionsSignature = buildTransactionsSignature(user?.transactions);

  return useMemo(() => {
    void transactionsSignature;
    void balance;
    void casinoBalance;
    return getProfileRankData(userId);
  }, [userId, transactionsSignature, balance, casinoBalance]);
}
