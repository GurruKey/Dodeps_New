import { Stack } from 'react-bootstrap';

import { TransactionsHistory } from './blocks/index.js';

export default function Transactions() {
  return (
    <Stack gap={3}>
      <TransactionsHistory />
    </Stack>
  );
}
