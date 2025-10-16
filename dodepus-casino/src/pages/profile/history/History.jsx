import { ProfileBlocksLayout } from '../layout/blocks';
import { useAuth } from '../../../app/providers';
import { TransactionsBlock, TransactionsPlaceholderBlock } from './blocks';

export default function History() {
  const { user } = useAuth();
  const transactions = Array.isArray(user?.transactions) ? user.transactions : [];
  const currency = user?.currency;
  const hasTransactions = transactions.length > 0;

  return (
    <ProfileBlocksLayout>
      {hasTransactions ? (
        <TransactionsBlock transactions={transactions} currency={currency} />
      ) : (
        <TransactionsPlaceholderBlock />
      )}
    </ProfileBlocksLayout>
  );
}
