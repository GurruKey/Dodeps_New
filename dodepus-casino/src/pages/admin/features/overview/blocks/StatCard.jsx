import { Card, Placeholder } from 'react-bootstrap';

export default function StatCard({ title, value, isLoading }) {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title
          className="text-uppercase text-secondary"
          style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}
        >
          {title}
        </Card.Title>
        <Card.Text className="fs-4 fw-semibold text-body">
          {isLoading ? <Placeholder xs={6} /> : value}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
