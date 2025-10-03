import { Stack } from 'react-bootstrap';
import TransactionsHistory from './blocks/Transactions/TransactionsHistory.jsx';

export default function TransactionsPage() {
  return (
    <Stack gap={3}>
      <TransactionsHistory />
    </Stack>
  );
}
