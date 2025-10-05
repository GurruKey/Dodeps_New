import { Card, Button } from 'react-bootstrap';
import { useAuth } from '../../../../../app/AuthContext.jsx';

export default function AuthenticatorBlock() {
  const { user, updateProfile } = useAuth();
  const enabled = !!user?.mfaEnabled;

  const toggle = () => updateProfile({ mfaEnabled: !enabled });

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Аутентификатор</Card.Title>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            {/* Гусь в цветной плашке */}
            <span
              aria-hidden
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                background: enabled ? '#198754' : '#dc3545', // зелёный/красный
                color: '#fff',
              }}
              title={enabled ? 'Включён' : 'Не настроен'}
            >
              🪿
            </span>

            <div>
              <div className={`fw-semibold ${enabled ? 'text-success' : 'text-danger'}`}>
                {enabled ? 'Включён' : 'Не настроен'}
              </div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {enabled
                  ? 'Коды приложения будут запрашиваться при входе.'
                  : 'Рекомендуем включить двухфакторную аутентификацию.'}
              </div>
            </div>
          </div>

          {/* Для мок-режима: кнопка переключения */}
          <div className="d-flex gap-2">
            {enabled ? (
              <Button variant="outline-danger" onClick={toggle}>Отключить</Button>
            ) : (
              <Button variant="warning" onClick={toggle}>Подключить</Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
