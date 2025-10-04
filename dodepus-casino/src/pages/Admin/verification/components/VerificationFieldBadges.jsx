import { Badge } from 'react-bootstrap';
import { getFieldEntries } from '../utils.js';

export default function VerificationFieldBadges({ fields }) {
  const entries = getFieldEntries(fields);

  return (
    <div className="d-flex flex-wrap gap-2">
      {entries.map((entry) => (
        <Badge
          key={entry.key}
          bg={entry.done ? 'success' : 'secondary'}
          className="fw-normal"
        >
          {entry.label}
        </Badge>
      ))}
    </div>
  );
}
