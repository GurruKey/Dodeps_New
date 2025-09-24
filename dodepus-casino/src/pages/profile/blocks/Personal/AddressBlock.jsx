import { useEffect, useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

const countries = [
  'Украина','Казахстан','Россия','Беларусь',
  'Литва','Латвия','Эстония','Польша',
  'Грузия','Армения','Другая страна',
];

export default function AddressBlock() {
  const { user, updateProfile } = useAuth();

  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity]       = useState(user?.city ?? '');
  const [address, setAddress] = useState(user?.address ?? '');

  useEffect(() => setCountry(user?.country ?? ''), [user?.country]);
  useEffect(() => setCity(user?.city ?? ''), [user?.city]);
  useEffect(() => setAddress(user?.address ?? ''), [user?.address]);

  const changed =
    country !== (user?.country ?? '') ||
    city !== (user?.city ?? '') ||
    address !== (user?.address ?? '');

  const onSubmit = (e) => {
    e.preventDefault();
    updateProfile({ country, city, address });
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Страна / Город / Адрес</Card.Title>
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Страна</Form.Label>
              <Form.Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Выберите страну…</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Город</Form.Label>
              <Form.Control
                type="text"
                placeholder="Например: Киев"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Адрес</Form.Label>
              <Form.Control
                type="text"
                placeholder="Улица, дом, квартира"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Col>
          </Row>

          <div className="mt-3">
            <Button type="submit" variant="warning" disabled={!changed}>
              Сохранить
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
