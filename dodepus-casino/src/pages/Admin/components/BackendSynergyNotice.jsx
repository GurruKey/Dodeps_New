import { Alert } from 'react-bootstrap';

export default function BackendSynergyNotice({ className = '' }) {
  return (
    <Alert variant="info" className={className}>
      <div className="fw-semibold mb-1">Связь с демо бэкендом</div>
      <div className="mb-0 small text-body-secondary">
        Все действия в этих разделах проходят через локальную демо-имитацию бэкенда.
        Назначение или изменение прав обновляет данные в моковом API, поэтому изменения
        сразу отражаются в списке клиентов и остальных инструментах панели.
      </div>
    </Alert>
  );
}
