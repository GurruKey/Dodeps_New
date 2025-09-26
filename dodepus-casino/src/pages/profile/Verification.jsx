import VerificationStatusBlock from './blocks/Verification/VerificationStatusBlock.jsx';
import VerificationUploadBlock from './blocks/Verification/VerificationUploadBlock.jsx';
import VerificationHistoryBlock from './blocks/Verification/VerificationHistoryBlock.jsx';

export default function Verification() {
  return (
    <div className="d-grid gap-4">
      <VerificationStatusBlock />
      <VerificationUploadBlock />
      <VerificationHistoryBlock />
    </div>
  );
}
