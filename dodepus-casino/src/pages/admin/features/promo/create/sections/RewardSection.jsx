import { Button, Card, Col, Form, Row } from 'react-bootstrap';

export default function RewardSection({
  rewardForm,
  rewardPreview,
  formValues,
  balanceOptions,
  onRewardChange,
  onRewardToggle,
  onFieldChange,
  onResetRewardToPreview,
}) {
  return (
    <section>
      <h5 className="mb-3">Конструктор награды</h5>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="reward-currency">
            <Form.Label>Валюта бонуса</Form.Label>
            <Form.Control value={rewardForm.currency} onChange={onRewardChange('currency')} placeholder="$" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="reward-balance">
            <Form.Label>Баланс для начисления</Form.Label>
            <Form.Select value={rewardForm.balanceType} onChange={onRewardChange('balanceType')}>
              {balanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Check
        type="switch"
        id="reward-deposit-enabled"
        className="mt-3"
        label="Добавить процент на депозит"
        checked={rewardForm.depositEnabled}
        onChange={onRewardToggle('depositEnabled', ['depositPercent', 'depositMaxAmount'])}
      />
      {rewardForm.depositEnabled && (
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="reward-deposit-percent">
              <Form.Label>% бонуса</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={rewardForm.depositPercent}
                onChange={onRewardChange('depositPercent')}
                placeholder="Например: 100"
              />
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group controlId="reward-deposit-cap">
              <Form.Label>Максимальная сумма бонуса</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={rewardForm.depositMaxAmount}
                onChange={onRewardChange('depositMaxAmount')}
                placeholder="Например: 500"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Form.Check
        type="switch"
        id="reward-cash-enabled"
        className="mt-3"
        label="Добавить фиксированную сумму"
        checked={rewardForm.cashEnabled}
        onChange={onRewardToggle('cashEnabled', ['cashAmount'])}
      />
      {rewardForm.cashEnabled && (
        <Form.Group controlId="reward-cash-amount" className="mt-2">
          <Form.Label>Сумма к начислению</Form.Label>
          <Form.Control
            type="number"
            min="0"
            value={rewardForm.cashAmount}
            onChange={onRewardChange('cashAmount')}
            placeholder="Например: 50"
          />
        </Form.Group>
      )}

      <Form.Check
        type="switch"
        id="reward-freespins-enabled"
        className="mt-3"
        label="Добавить фриспины"
        checked={rewardForm.freeSpinsEnabled}
        onChange={onRewardToggle('freeSpinsEnabled', ['freeSpins', 'freeSpinsValue', 'freeSpinsGame'])}
      />
      {rewardForm.freeSpinsEnabled && (
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="reward-freespins-count">
              <Form.Label>Количество FS</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={rewardForm.freeSpins}
                onChange={onRewardChange('freeSpins')}
                placeholder="Например: 50"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="reward-freespins-value">
              <Form.Label>Стоимость FS</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={rewardForm.freeSpinsValue}
                onChange={onRewardChange('freeSpinsValue')}
                placeholder="Например: 0.1"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="reward-freespins-game">
              <Form.Label>Игра</Form.Label>
              <Form.Control
                value={rewardForm.freeSpinsGame}
                onChange={onRewardChange('freeSpinsGame')}
                placeholder="Например: Book of Ra"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Form.Check
        type="switch"
        id="reward-custom-text-enabled"
        className="mt-3"
        label="Добавить пользовательский текст"
        checked={rewardForm.customTextEnabled}
        onChange={onRewardToggle('customTextEnabled', ['customText'])}
      />
      {rewardForm.customTextEnabled && (
        <Form.Group controlId="reward-custom-text" className="mt-2">
          <Form.Control
            as="textarea"
            rows={2}
            value={rewardForm.customText}
            onChange={onRewardChange('customText')}
            placeholder="Например: + участие в розыгрыше"
          />
        </Form.Group>
      )}

      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">Превью награды</div>
              <div className="text-muted small">Автосборка пересобирается при изменении конструкторов</div>
            </div>
            <Button variant="outline-primary" size="sm" type="button" onClick={onResetRewardToPreview}>
              Подставить автосборку
            </Button>
          </div>
          <div className="mt-2">{rewardPreview || 'Добавьте элементы, чтобы увидеть описание.'}</div>
        </Card.Body>
      </Card>

      <Form.Group controlId="promo-reward-text" className="mt-3">
        <Form.Label>Текст награды (ручная правка)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formValues.reward}
          onChange={onFieldChange('reward')}
          placeholder="Например: 100% до 500$ + 50 FS"
        />
        <Form.Text className="text-muted">
          Можно скорректировать вручную — автосборка не будет перезаписывать поле, пока вы не вернёте её кнопкой выше.
        </Form.Text>
      </Form.Group>
    </section>
  );
}
