import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Stack,
} from 'react-bootstrap';
import { availableRanks } from '../../data/rankConfigs.js';
import { assignUserRank } from '../../../../../../../features/auth/api.js';

const idPlaceholderExamples = ['ID-40012', 'ID-50177', 'ID-61203'];

export default function AssignRank({ statusMessage = '' }) {
  const [searchId, setSearchId] = useState('');
  const [selectedRank, setSelectedRank] = useState(availableRanks[0]?.id ?? '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastIssuedRank, setLastIssuedRank] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { onReload } = useOutletContext() ?? {};

  const placeholder = useMemo(() => {
    const index = Math.floor(Math.random() * idPlaceholderExamples.length);
    return `Например: ${idPlaceholderExamples[index]}`;
  }, []);

  const selectedRankConfig = useMemo(
    () => availableRanks.find((rank) => rank.id === selectedRank) ?? null,
    [selectedRank]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedId = searchId.trim();
    if (!trimmedId || !selectedRank) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const updatedUser = await assignUserRank({
        userId: trimmedId,
        rankId: selectedRank,
      });

      const rankConfig = selectedRankConfig;
      setLastIssuedRank({
        userId: updatedUser?.id ?? trimmedId,
        rankName: rankConfig?.name ?? rankConfig?.id ?? selectedRank,
        rankGroup: rankConfig?.group ?? updatedUser?.playerRank ?? null,
        rankTier:
          typeof rankConfig?.tier === 'number'
            ? rankConfig.tier
            : typeof updatedUser?.playerRankTier === 'number'
            ? updatedUser.playerRankTier
            : null,
        issuedAt: new Date().toLocaleString('ru-RU'),
      });

      if (typeof onReload === 'function') {
        onReload();
      }
    } catch (error) {
      setLastIssuedRank(null);
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось назначить ранг.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <Card.Body as={Form} onSubmit={handleSubmit}>
        <Stack gap={3}>
          <div>
            <Card.Title as="h4" className="mb-1">
              Выдать ранг
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Назначьте игроку новый ранг и обновите его привилегии. {statusMessage}
            </Card.Text>
          </div>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Label htmlFor="assign-rank-user-id" className="fw-medium">
                ID игрока
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>#</InputGroup.Text>
                <Form.Control
                  id="assign-rank-user-id"
                  value={searchId}
                  onChange={(event) => setSearchId(event.target.value)}
                  placeholder={placeholder}
                  autoComplete="off"
                />
              </InputGroup>
              <Form.Text>Работает только точный поиск по ID.</Form.Text>
            </Col>

            <Col xs={12} md={6}>
              <Form.Label htmlFor="assign-rank" className="fw-medium">
                Новый ранг
              </Form.Label>
              <Form.Select
                id="assign-rank"
                value={selectedRank}
                onChange={(event) => setSelectedRank(event.target.value)}
              >
                {availableRanks.map((rank) => (
                  <option key={rank.id} value={rank.id}>
                    {rank.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text>{selectedRankConfig?.description ?? ''}</Form.Text>
            </Col>
          </Row>

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" disabled={isProcessing || !searchId.trim()}>
              {isProcessing ? 'Обновляем…' : 'Выдать ранг'}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setSearchId('');
                setSelectedRank(availableRanks[0]?.id ?? '');
                setErrorMessage('');
                setLastIssuedRank(null);
              }}
              disabled={isProcessing}
            >
              Сбросить
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="danger" className="mb-0">
              {errorMessage}
            </Alert>
          )}

          {lastIssuedRank && (
            <Card className="border-0 surface-card">
              <Card.Body className="py-3">
                <strong>{lastIssuedRank.userId}</strong> получил ранг «{lastIssuedRank.rankName}»{' '}
                <span className="text-muted">{lastIssuedRank.issuedAt}</span>
              </Card.Body>
            </Card>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}
