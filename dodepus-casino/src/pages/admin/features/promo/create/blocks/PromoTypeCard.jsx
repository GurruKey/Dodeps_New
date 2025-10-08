import { Badge, Card } from 'react-bootstrap';

const formatFormula = (formula) => {
  if (typeof formula !== 'string' || !formula.trim()) return null;
  return formula.trim();
};

export default function PromoTypeCard({ type, selected, onSelect }) {
  if (!type) {
    return null;
  }

  const formula = formatFormula(type.formula);
  const notes = typeof type.plainText === 'string' ? type.plainText.trim() : '';

  const handleClick = () => {
    if (typeof onSelect === 'function') {
      onSelect(type.id);
    }
  };

  return (
    <Card
      className={`h-100 shadow-sm ${selected ? 'border-primary' : 'border-light'}`}
      role="button"
      onClick={handleClick}
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <Card.Title as="h5" className="mb-0">
            {type.name}
          </Card.Title>
          {selected && <Badge bg="primary">Выбрано</Badge>}
        </div>
        <Card.Text className="text-muted mb-2">{type.howItWorks}</Card.Text>
        {formula && (
          <Card.Text className="small text-body-secondary mb-2">{formula}</Card.Text>
        )}
        {notes && <Card.Text className="small fw-medium mb-0">{notes}</Card.Text>}
      </Card.Body>
      {type.seed && (
        <Card.Footer className="small text-muted">
          Пример: {type.seed.title ?? type.seed.reward ?? '—'} ({type.seed.code})
        </Card.Footer>
      )}
    </Card>
  );
}
