import { useMemo, useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../app/AuthContext.jsx';

const monthNames = ['01','02','03','04','05','06','07','08','09','10','11','12'];

function parseDob(dob) {
  if (!dob) return { d: '', m: '', y: '' };
  const [y, m, d] = dob.split('-');
  return { d, m, y };
}

function calcAge(d, m, y) {
  if (!d || !m || !y) return null;
  const today = new Date();
  const birth = new Date(Number(y), Number(m) - 1, Number(d));
  let age = today.getFullYear() - birth.getFullYear();
  const mm = today.getMonth() - birth.getMonth();
  if (mm < 0 || (mm === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

export default function GenderDobBlock() {
  const { user, updateProfile } = useAuth();

  const init = useMemo(() => parseDob(user?.dob), [user?.dob]);

  const [gender, setGender] = useState(user?.gender ?? 'unspecified');
  const [d, setD] = useState(init.d);
  const [m, setM] = useState(init.m);
  const [y, setY] = useState(init.y);

  useEffect(() => {
    setGender(user?.gender ?? 'unspecified');
  }, [user?.gender]);

  useEffect(() => {
    const next = parseDob(user?.dob);
    setD(next.d);
    setM(next.m);
    setY(next.y);
  }, [user?.dob]);

  const age = calcAge(d, m, y);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const max = now - 18;     // минимальный возраст 18
    const min = now - 100;    // разумная нижняя граница
    const list = [];
    for (let yy = max; yy >= min; yy--) list.push(String(yy));
    return list;
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  const changed =
    gender !== (user?.gender ?? 'unspecified') ||
    `${y}-${m}-${d}` !== (user?.dob ?? '---');

  const onSubmit = (e) => {
    e.preventDefault();
    const dob = d && m && y ? `${y}-${m}-${d}` : null;
    updateProfile({ gender, dob });
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Пол и дата рождения</Card.Title>
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="d-block">Пол</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="gender-male"
                  name="gender"
                  label="Мужчина"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                />
                <Form.Check
                  type="radio"
                  id="gender-female"
                  name="gender"
                  label="Женщина"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                />
                <Form.Check
                  type="radio"
                  id="gender-unspecified"
                  name="gender"
                  label="Не указан"
                  checked={gender === 'unspecified'}
                  onChange={() => setGender('unspecified')}
                />
              </div>
            </Col>

            <Col md={6}>
              <Form.Label>Дата рождения</Form.Label>
              <Row className="g-2">
                <Col xs={4}>
                  <Form.Select value={d} onChange={(e) => setD(e.target.value)}>
                    <option value="">ДД</option>
                    {days.map((dd) => (
                      <option key={dd} value={dd}>{dd}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={4}>
                  <Form.Select value={m} onChange={(e) => setM(e.target.value)}>
                    <option value="">MM</option>
                    {monthNames.map((mm) => (
                      <option key={mm} value={mm}>{mm}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={4}>
                  <Form.Select value={y} onChange={(e) => setY(e.target.value)}>
                    <option value="">ГГГГ</option>
                    {years.map((yy) => (
                      <option key={yy} value={yy}>{yy}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              {age !== null && (
                <Form.Text className="text-muted">Возраст: {age}</Form.Text>
              )}
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
