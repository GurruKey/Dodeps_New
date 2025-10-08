import { Stack } from 'react-bootstrap';
import TransactionsHistory from './blocks/TransactionsHistory.jsx';

export default function Transactions() {
  return (
    <Stack gap={3}>
      <TransactionsHistory />
    </Stack>
  );
}


