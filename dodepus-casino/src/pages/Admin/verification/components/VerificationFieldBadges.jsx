import { Badge } from 'react-bootstrap';
import { getFieldEntries } from '../utils.js';

export default function VerificationFieldBadges({ fields, status, requested }) {
  const entries = getFieldEntries(fields, { status, requested });

  return (
    <div className="d-flex flex-wrap gap-2">
      {entries.map((entry) => (
        <Badge
          key={entry.key}
          bg={entry.variant}
          className="fw-normal"
        >
          {entry.label}
        </Badge>
      ))}
    </div>
  );
}
