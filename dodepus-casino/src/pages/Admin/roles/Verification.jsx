import { Stack } from 'react-bootstrap';
import VerificationQueue from './blocks/Verification/VerificationQueue.jsx';

export default function VerificationPage() {
  return (
    <Stack gap={3}>
      <VerificationQueue />
    </Stack>
  );
}
