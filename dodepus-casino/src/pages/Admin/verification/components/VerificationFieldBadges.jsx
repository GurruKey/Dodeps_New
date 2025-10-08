import { Badge, Button } from 'react-bootstrap';
import { Circle, CircleHelp, CheckCircle2, CircleX } from 'lucide-react';
import { VERIFICATION_MODULES } from '../../../../shared/verification/index.js';

const ICON_CONFIG = {
  approved: { Component: CheckCircle2, className: 'text-success' },
  pending: { Component: CircleHelp, className: 'text-warning' },
  rejected: { Component: CircleX, className: 'text-danger' },
  idle: { Component: Circle, className: 'text-secondary' },
};

const STATE_VARIANT = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  idle: 'secondary',
};

const STATE_BUTTON_VARIANT = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  idle: 'secondary',
};

export default function VerificationFieldBadges({ modules, onSelect }) {
  const items = Array.isArray(modules)
    ? modules
    : VERIFICATION_MODULES.map((module) => ({ ...module, status: 'idle' }));

  if (typeof onSelect === 'function') {
    return (
      <div className="d-flex flex-wrap gap-2">
        {items.map((item) => {
          const state = item.status || 'idle';
          const config = ICON_CONFIG[state] || ICON_CONFIG.idle;
          const IconComponent = config.Component;
          const disabled = state === 'idle';

          const handleClick = (event) => {
            event?.stopPropagation?.();
            if (disabled) {
              return;
            }
            onSelect?.(item, event);
          };

          return (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={STATE_BUTTON_VARIANT[state] || 'secondary'}
              className="d-inline-flex align-items-center gap-2 px-3"
              onClick={handleClick}
              disabled={disabled}
            >
              <IconComponent
                size={16}
                className={config.className}
                style={config.style}
              />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {items.map((item) => {
        const state = item.status || 'idle';
        const config = ICON_CONFIG[state] || ICON_CONFIG.idle;
        const IconComponent = config.Component;
        return (
          <Badge
            key={item.key}
            bg={STATE_VARIANT[state] || 'secondary'}
            className="fw-normal d-inline-flex align-items-center gap-2"
          >
            <IconComponent
              size={16}
              className={config.className}
              style={config.style}
            />
            <span>{item.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
