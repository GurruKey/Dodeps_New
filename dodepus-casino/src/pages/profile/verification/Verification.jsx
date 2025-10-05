import {
  VerificationStatusBlock,
  VerificationUploadBlock,
  VerificationHistoryBlock,
} from './blocks';

export default function Verification() {
  return (
    <div className="d-grid gap-4">
      <VerificationStatusBlock />
      <VerificationUploadBlock />
      <VerificationHistoryBlock />
    </div>
  );
}
