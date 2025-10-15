import { useMemo } from 'react';
import { useAuth } from '../../../../app/providers';
import { getProfileRankSummary } from '../../../../../local-sim/modules/rank/api.js';

const buildTransactionsSignature = (transactions) =>
  (Array.isArray(transactions) ? transactions : [])
    .map((txn) => {
      if (!txn || typeof txn !== 'object') {
        return '';
      }
      return txn.id || `${txn.type}:${txn.amount}:${txn.date}`;
    })
    .join('|');

export function useProfileRankSummary() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const balance = user?.balance ?? null;
  const casinoBalance = user?.casinoBalance ?? null;
  const transactionsSignature = buildTransactionsSignature(user?.transactions);

  return useMemo(() => {
    void transactionsSignature;
    void balance;
    void casinoBalance;
    return getProfileRankSummary(userId);
  }, [userId, transactionsSignature, balance, casinoBalance]);
}
