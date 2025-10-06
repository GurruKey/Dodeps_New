import { Badge } from 'react-bootstrap';
import { Circle, CircleAlert, CircleHelp, CheckCircle2 } from 'lucide-react';
import { getFieldEntries } from '../utils.js';

const ICON_CONFIG = {
  approved: { Component: CheckCircle2, className: 'text-success' },
  pending: { Component: CircleHelp, className: 'text-warning' },
  rejected: { Component: CircleAlert, style: { color: '#fd7e14' } },
  idle: { Component: Circle, className: 'text-secondary' },
};

export default function VerificationFieldBadges({ fields, status, requested }) {
  const entries = getFieldEntries(fields, { status, requested });

  return (
    <div className="d-flex flex-wrap gap-2">
      {entries.map((entry) => (
        <Badge
          key={entry.key}
          bg={entry.variant}
          className="fw-normal d-inline-flex align-items-center gap-2"
        >
          {(() => {
            const config = ICON_CONFIG[entry.state] || ICON_CONFIG.idle;
            const IconComponent = config.Component;
            return (
              <IconComponent
                size={16}
                className={config.className}
                style={config.style}
              />
            );
          })()}
          <span>{entry.label}</span>
        </Badge>
      ))}
    </div>
  );
}
