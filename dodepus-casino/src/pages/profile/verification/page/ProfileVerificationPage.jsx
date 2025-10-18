import { ProfileBlocksLayout } from '@/pages/profile/layout/blocks';
import { ModuleStatusBlock, VerificationHistoryBlock } from '../blocks';

export default function ProfileVerificationPage() {
  return (
    <ProfileBlocksLayout>
      <ModuleStatusBlock />
      <VerificationHistoryBlock />
    </ProfileBlocksLayout>
  );
}
