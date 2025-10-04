import { Card, Placeholder, Stack } from 'react-bootstrap';

export default function PromoCodeCreate() {
  return (
    <Stack gap={3}>
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-3">
            Создать промокод
          </Card.Title>
          <Card.Text className="text-muted">
            Здесь появится форма создания промокода. Раздел подготовлен и ждёт наполнения.
          </Card.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title as="h4" className="mb-3">
            Черновик интерфейса
          </Card.Title>
          <Stack gap={3}>
            <Placeholder as={Card.Text} animation="wave">
              <Placeholder xs={8} />
              <Placeholder xs={6} />
              <Placeholder xs={4} />
            </Placeholder>
            <Placeholder.Button variant="primary" xs={3} aria-hidden />
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}
