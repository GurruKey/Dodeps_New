import { Accordion, Badge, Card } from 'react-bootstrap';
import { promoTypeDefinitions } from '../../../../../../../local-sim/modules/promo/definitions/index.js';

export default function PromoTypesReference({ selectedTypeId }) {
  const defaultActiveKey = selectedTypeId
    ? [selectedTypeId]
    : promoTypeDefinitions.length > 0
    ? [promoTypeDefinitions[0].id]
    : [];

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h4" className="h5">Справочник типов промо</Card.Title>
        <Card.Text className="text-muted mb-3">
          Короткая памятка: в блоке «Базовые параметры» выберите тип, а здесь подсмотритесь за механикой и примерами.
        </Card.Text>
        <Accordion alwaysOpen defaultActiveKey={defaultActiveKey}>
          {promoTypeDefinitions.map((type) => {
            const selected = type.id === selectedTypeId;
            return (
              <Accordion.Item eventKey={type.id} key={type.id}>
                <Accordion.Header>
                  <div className="d-flex align-items-center gap-2">
                    <span>{type.name}</span>
                    {selected && <Badge bg="primary">Выбрано в форме</Badge>}
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
                    <Card className="border-0 surface-card">
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
                  <Card.Text className="small text-muted mt-3 mb-0">
                    Чтобы применить этот тип, выберите его в выпадающем списке слева.
                  </Card.Text>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Card.Body>
    </Card>
  );
}
