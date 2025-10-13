import { useMemo, useState } from 'react';
import { Accordion, Badge, Button, Card, Form, Stack } from 'react-bootstrap';
import {
  availableRanks,
  rankBenefitMatrix,
  rankGroups,
  rankMatrixLegend,
} from '../../data/rankConfigs.js';

const benefitKeys = Object.keys(rankMatrixLegend);

export default function EditRankBenefits() {
  const [matrix, setMatrix] = useState(() =>
    rankBenefitMatrix.map((rank) => ({
      ...rank,
      benefits: { ...rank.benefits },
    }))
  );
  const [activeGroup, setActiveGroup] = useState(rankGroups[0]?.key ?? null);
  const [expandedRanks, setExpandedRanks] = useState([]);

  const groupedRanks = useMemo(() => {
    const groups = rankGroups.reduce((acc, group) => {
      acc[group.key] = [];
      return acc;
    }, {});

    matrix.forEach((rank) => {
      const meta = availableRanks.find((candidate) => candidate.id === rank.rankId) ?? null;
      const groupKey = meta?.group && groups[meta.group] ? meta.group : rankGroups[0].key;

      groups[groupKey].push({
        ...rank,
        meta,
      });
    });

    return groups;
  }, [matrix]);

  const handleToggleBenefit = (rankId, benefitKey) => {
    setMatrix((prev) =>
      prev.map((rank) =>
        rank.rankId === rankId
          ? {
              ...rank,
              benefits: {
                ...rank.benefits,
                [benefitKey]: !(rank.benefits[benefitKey] ?? false),
              },
            }
          : rank
      )
    );
  };

  const handleToggleAll = (rankId, nextValue) => {
    setMatrix((prev) =>
      prev.map((rank) =>
        rank.rankId === rankId
          ? {
              ...rank,
              benefits: benefitKeys.reduce((acc, key) => {
                acc[key] = nextValue;
                return acc;
              }, {}),
            }
          : rank
      )
    );
  };

  const handleAccordionSelect = (eventKey) => {
    if (!eventKey) {
      setExpandedRanks([]);
      return;
    }

    if (Array.isArray(eventKey)) {
      setExpandedRanks(eventKey.filter(Boolean));
      return;
    }

    const key = String(eventKey);
    setExpandedRanks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return Array.from(next);
    });
  };

  return (
    <Stack gap={3}>
      <Card className="border-0 surface-card">
        <Card.Body>
          <Card.Title as="h4" className="mb-2">
            Пользовательские ранги
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Сформируйте привилегии для каждого ранга. Настройки пока сохраняются только локально —
            позже подключим синхронизацию с backend.
          </Card.Text>
        </Card.Body>
      </Card>

      <div className="d-flex flex-wrap gap-2">
        {rankGroups.map((group) => (
          <Button
            key={group.key}
            variant={group.key === activeGroup ? 'primary' : 'outline-secondary'}
            onClick={() => setActiveGroup(group.key)}
          >
            {group.label}
          </Button>
        ))}
      </div>

      {rankGroups.map((group) =>
        group.key === activeGroup ? (
          <Accordion
            key={group.key}
            activeKey={expandedRanks}
            alwaysOpen
            onSelect={handleAccordionSelect}
            className="border rounded"
          >
            {(groupedRanks[group.key] ?? []).map((rank) => {
              const rankTier = typeof rank.meta?.tier === 'number' ? rank.meta.tier : null;
              const description = rank.meta?.description ?? '';

              return (
                <Accordion.Item eventKey={rank.rankId} key={rank.rankId}>
                  <Accordion.Header>
                    <div className="d-flex flex-column flex-md-row w-100 align-items-md-center">
                      <span className="fw-semibold me-md-3">{rank.rankName}</span>
                      {rankTier !== null && (
                        <Badge bg="secondary" className="mt-2 mt-md-0">
                          tier {rankTier}
                        </Badge>
                      )}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Stack gap={3}>
                      {description && <Card.Text className="text-muted mb-0">{description}</Card.Text>}
                      <div className="d-flex flex-column flex-md-row gap-2">
                        <Button
                          variant="outline-danger"
                          onClick={() => handleToggleAll(rank.rankId, false)}
                          disabled={benefitKeys.every((key) => !(rank.benefits[key] ?? false))}
                        >
                          Убрать все привилегии
                        </Button>
                        <Button
                          variant="outline-success"
                          onClick={() => handleToggleAll(rank.rankId, true)}
                          disabled={benefitKeys.every((key) => Boolean(rank.benefits[key]))}
                        >
                          Включить все привилегии
                        </Button>
                      </div>
                      <div className="d-grid gap-3">
                        {benefitKeys.map((benefitKey) => (
                          <Form.Check
                            key={benefitKey}
                            type="switch"
                            id={`${rank.rankId}-${benefitKey}`}
                            checked={rank.benefits[benefitKey] ?? false}
                            onChange={() => handleToggleBenefit(rank.rankId, benefitKey)}
                            label={
                              <span className="d-flex flex-column text-start">
                                <span className="fw-semibold">{rankMatrixLegend[benefitKey]}</span>
                                <small className="text-muted">
                                  {rank.benefits[benefitKey] ? 'Привилегия активна' : 'Привилегия отключена'}
                                </small>
                              </span>
                            }
                          />
                        ))}
                      </div>
                    </Stack>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
            {(groupedRanks[group.key] ?? []).length === 0 && (
              <Card className="border-0 surface-card">
                <Card.Body className="py-4 text-center text-muted">
                  Пока нет рангов в этой категории.
                </Card.Body>
              </Card>
            )}
          </Accordion>
        ) : null
      )}
    </Stack>
  );
}
