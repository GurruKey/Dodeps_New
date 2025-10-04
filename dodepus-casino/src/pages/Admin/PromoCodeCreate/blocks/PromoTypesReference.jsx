import { Accordion, Badge, Button, Card } from 'react-bootstrap';
import { promoTypeDefinitions } from '../../../../../local-sim/admin/promocodes/definitions';

export default function PromoTypesReference({ selectedTypeId, onSelect }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h4" className="h5">Справочник типов промо</Card.Title>
        <Card.Text className="text-muted mb-3">
          Здесь можно ознакомиться с механикой каждого типа промокода и быстро выбрать нужный.
        </Card.Text>
        <Accordion alwaysOpen defaultActiveKey={selectedTypeId ? [selectedTypeId] : undefined}>
          {promoTypeDefinitions.map((type) => {
            const selected = type.id === selectedTypeId;
            return (
              <Accordion.Item eventKey={type.id} key={type.id}>
                <Accordion.Header>
                  <div className="d-flex align-items-center gap-2">
                    <span>{type.name}</span>
                    {selected && <Badge bg="primary">Выбрано</Badge>}
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Card.Text className="mb-2">{type.howItWorks}</Card.Text>
                  {type.formula && (
                    <Card.Text className="small text-body-secondary mb-2">{type.formula}</Card.Text>
                  )}
                  {type.plainText && (
                    <Card.Text className="small fw-medium mb-3">{type.plainText}</Card.Text>
                  )}
                  {type.seed && (
                    <Card className="bg-light border-0">
                      <Card.Body className="py-3">
                        <div className="fw-semibold mb-1">Пример оффера</div>
                        {type.seed.title && (
                          <div className="small text-muted mb-1">{type.seed.title}</div>
                        )}
                        {type.seed.reward && <div className="small">{type.seed.reward}</div>}
                        {type.seed.code && (
                          <div className="small text-muted mt-2">Код: {type.seed.code}</div>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant={selected ? 'primary' : 'outline-primary'}
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (typeof onSelect === 'function') {
                          onSelect(type.id);
                        }
                      }}
                    >
                      {selected ? 'Тип выбран' : 'Выбрать тип'}
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Card.Body>
    </Card>
  );
}
