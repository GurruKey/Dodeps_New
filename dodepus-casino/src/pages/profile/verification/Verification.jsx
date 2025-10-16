import { ProfileBlocksLayout } from '../layout/blocks';
import { ModuleStatusBlock, VerificationHistoryBlock } from './blocks';

export default function Verification() {
  return (
    <ProfileBlocksLayout>
      <ModuleStatusBlock />
      <VerificationHistoryBlock />
    </ProfileBlocksLayout>
  );
}
