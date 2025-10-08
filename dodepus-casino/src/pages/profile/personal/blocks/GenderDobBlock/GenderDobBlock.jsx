import { useMemo, useState, useEffect } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

const monthNames = ['01','02','03','04','05','06','07','08','09','10','11','12'];

function parseDob(dob) {
  if (!dob) return { d: '', m: '', y: '' };
  const [y, m, d] = dob.split('-');
  return { d, m, y };
}
function daysInMonth(m, y) {
  if (!m || !y) return 31;
  return new Date(Number(y), Number(m), 0).getDate();
}

export default function GenderDobBlock() {
  const { user, updateProfile } = useAuth();
  const fieldsLocked = false;

  const init = useMemo(() => parseDob(user?.dob), [user?.dob]);
  const normalizeGender = (g) => (g === 'male' || g === 'female' ? g : '');
  const [gender, setGender] = useState(normalizeGender(user?.gender));
  const [d, setD] = useState(init.d);
  const [m, setM] = useState(init.m);
  const [y, setY] = useState(init.y);

  useEffect(() => setGender(normalizeGender(user?.gender)), [user?.gender]);
  useEffect(() => {
    const next = parseDob(user?.dob);
    setD(next.d);
    setM(next.m);
    setY(next.y);
  }, [user?.dob]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const max = now - 18, min = now - 100;
    return Array.from({ length: max - min + 1 }, (_, i) => String(max - i));
  }, []);
  const days = useMemo(() => {
    const lim = daysInMonth(m, y);
    return Array.from({ length: lim }, (_, i) => String(i + 1).padStart(2, '0'));
  }, [m, y]);

  const newDob = d && m && y ? `${y}-${m}-${d}` : null;
  const currentDob = user?.dob ?? null;
  const currentGender = normalizeGender(user?.gender);
  const changed = gender !== currentGender || newDob !== currentDob;

  useEffect(() => {
    const id = 'block:genderdob';
    window.dispatchEvent(
      new CustomEvent('personal:dirty', { detail: { id, dirty: !!changed } }),
    );
    return () =>
      window.dispatchEvent(
        new CustomEvent('personal:dirty', { detail: { id, dirty: false } }),
      );
  }, [changed]);

  useEffect(() => {
    const onSave = () => {
      if (!changed) return;
      const patch = { dob: newDob };
      if (gender === 'male' || gender === 'female') patch.gender = gender;
      updateProfile(patch);
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, gender, newDob, updateProfile]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Пол и дата рождения</Card.Title>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="d-block">Пол</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio" id="gender-male" name="gender" label="Мужчина"
                  checked={gender === 'male'} onChange={() => setGender('male')}
                  disabled={fieldsLocked}
                />
                <Form.Check
                  type="radio" id="gender-female" name="gender" label="Женщина"
                  checked={gender === 'female'} onChange={() => setGender('female')}
                  disabled={fieldsLocked}
                />
              </div>
            </Col>
            <Col md={6}>
              <Form.Label>Дата рождения</Form.Label>
              <Row className="g-2">
                <Col xs={4}>
                  <Form.Select value={d} onChange={(e) => setD(e.target.value)} disabled={fieldsLocked}>
                    <option value="">ДД</option>
                    {days.map((dd) => <option key={dd} value={dd}>{dd}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={4}>
                  <Form.Select value={m} onChange={(e) => setM(e.target.value)} disabled={fieldsLocked}>
                    <option value="">MM</option>
                    {monthNames.map((mm) => <option key={mm} value={mm}>{mm}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={4}>
                  <Form.Select value={y} onChange={(e) => setY(e.target.value)} disabled={fieldsLocked}>
                    <option value="">ГГГГ</option>
                    {years.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}
