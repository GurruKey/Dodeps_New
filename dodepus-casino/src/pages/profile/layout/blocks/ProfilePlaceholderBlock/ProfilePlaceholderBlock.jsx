import { Card, Stack } from 'react-bootstrap';

export function ProfilePlaceholderBlock({
  title,
  description,
  icon = null,
  actions = null,
  children = null,
}) {
  return (
    <Card>
      <Card.Body>
        <Stack gap={3} className="align-items-center text-center">
          {icon ? <div className="text-secondary fs-1">{icon}</div> : null}

          {title ? (
            <Card.Title as="h2" className="fs-4 mb-0">
              {title}
            </Card.Title>
          ) : null}

          {description ? <p className="text-muted mb-0">{description}</p> : null}

          {children}

          {actions ? (
            <div className="d-flex flex-wrap justify-content-center gap-2 w-100">
              {actions}
            </div>
          ) : null}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export default ProfilePlaceholderBlock;
