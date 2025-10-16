import { Card } from 'react-bootstrap';

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(' ');

export function VerificationFormLayout({
  title,
  layout = 'card',
  children,
  className,
  bodyClassName,
  titleClassName,
  plainWrapperClassName,
  plainTitleClassName,
}) {
  if (layout === 'plain') {
    return (
      <div className={joinClassNames('d-grid gap-3', className, plainWrapperClassName)}>
        {title ? (
          <div className={joinClassNames('fw-semibold fs-5', plainTitleClassName)}>{title}</div>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <Card className={className}>
      <Card.Body className={joinClassNames('d-grid gap-3', bodyClassName)}>
        {title ? (
          <Card.Title className={joinClassNames('mb-0', titleClassName)}>{title}</Card.Title>
        ) : null}
        {children}
      </Card.Body>
    </Card>
  );
}

export default VerificationFormLayout;
