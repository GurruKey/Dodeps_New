import { ModuleStatusWidget } from '../widgets/ModuleStatusWidget.jsx';
import { VerificationHistory } from '../history/VerificationHistory.jsx';

export default function VerificationPage() {
  return (
    <div className="d-grid gap-4">
      <ModuleStatusWidget />
      <VerificationHistory />
    </div>
  );
}
