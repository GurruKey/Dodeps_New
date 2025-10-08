import { useEffect, useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';
import { useVerificationModules } from '../../../../../shared/verification/index.js';

const countries = [
  'Украина','Казахстан','Россия','Беларусь',
  'Литва','Латвия','Эстония','Польша',
  'Грузия','Армения','Другая страна',
];

const t = (v) => (v ?? '').trim();

export default function AddressBlock() {
  const { user, updateProfile } = useAuth();
  const { modules: verificationModules = {} } = useVerificationModules(user);

  const addressStatus = String(verificationModules?.address?.status || '').toLowerCase();
  const addressLocked = addressStatus === 'pending' || addressStatus === 'approved';

  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity]       = useState(user?.city ?? '');
  const [address, setAddress] = useState(user?.address ?? '');

  // Синхронизация при смене пользователя/профиля
  useEffect(() => setCountry(user?.country ?? ''), [user?.country]);
  useEffect(() => setCity(user?.city ?? ''),       [user?.city]);
  useEffect(() => setAddress(user?.address ?? ''), [user?.address]);

  const changed =
    t(country) !== t(user?.country) ||
    t(city)    !== t(user?.city)    ||
    t(address) !== t(user?.address);

  // ⚡ Сообщаем кнопке о "грязном" состоянии блока
  useEffect(() => {
    const id = 'block:address';
    window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: !!changed } }));
    return () => {
      window.dispatchEvent(new CustomEvent('personal:dirty', { detail: { id, dirty: false } }));
    };
  }, [changed]);

  // Глобальное сохранение по общей кнопке
  useEffect(() => {
    const onSave = () => {
      if (!changed) return;
      updateProfile({ country: t(country), city: t(city), address: t(address) });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, country, city, address, updateProfile]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Страна / Город / Адрес</Card.Title>
        {/* Локального сабмита нет — сохраняем общей кнопкой */}
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Страна</Form.Label>
              <Form.Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={addressLocked}
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
                disabled={addressLocked}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Адрес</Form.Label>
              <Form.Control
                type="text"
                placeholder="Улица, дом, квартира"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={addressLocked}
              />
            </Col>
          </Row>
          {addressStatus === 'pending' && (
            <Form.Text className="text-muted d-block mt-2">
              Данные отправлены на проверку. Изменить адрес можно после решения администратора.
            </Form.Text>
          )}
          {addressStatus === 'approved' && (
            <Form.Text className="text-muted d-block mt-2">
              Адрес подтверждён и заблокирован для редактирования.
            </Form.Text>
          )}
          {addressStatus === 'rejected' && (
            <Form.Text className="text-warning d-block mt-2">
              Адрес отклонён. Обновите данные и отправьте их повторно.
            </Form.Text>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
