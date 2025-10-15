import { Card, Placeholder } from 'react-bootstrap';

export default function StatCard({ title, value, isLoading }) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center gap-2 py-4">
        <Card.Title className="text-uppercase text-secondary fw-semibold mb-0" style={{ fontSize: '0.8rem' }}>
          {title}
        </Card.Title>
        <Card.Text className="display-6 fw-bold mb-0">
          {isLoading ? <Placeholder xs={4} /> : value}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
