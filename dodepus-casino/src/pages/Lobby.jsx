import { useMemo, useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Form, Stack } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { games, categories, providers } from '../data/games.js';
import GameCover from '../shared/ui/GameCover.jsx';

export default function Lobby() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Инициализация из URL (?cat=...)
  const initialCat = searchParams.get('cat') || '';
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(initialCat);
  const [prov, setProv] = useState('');
  const [sort, setSort] = useState('title-asc');

  // Если URL меняется (переход со страницы категорий) — обновим состояние
  useEffect(() => {
    const nextCat = searchParams.get('cat') || '';
    setCat(nextCat);
  }, [searchParams]);

  // Поддержим синхронизацию фильтра категории с URL
  const updateCat = (value) => {
    setCat(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('cat', value);
    else next.delete('cat');
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...games];

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(s) ||
          g.provider.toLowerCase().includes(s) ||
          g.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }
    if (cat) list = list.filter((g) => g.category === cat);
    if (prov) list = list.filter((g) => g.provider === prov);

    switch (sort) {
      case 'rtp-desc':
        list.sort((a, b) => (b.rtp ?? 0) - (a.rtp ?? 0));
        break;
      case 'title-asc':
      default:
        list.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    }
    return list;
  }, [q, cat, prov, sort]);

  const handleReset = () => {
    setQ('');
    setProv('');
    setSort('title-asc');
    updateCat('');
    setSearchParams({});
  };

  return (
    <>
      <h2 className="mb-3">Лобби</h2>

      <Stack direction="horizontal" gap={2} className="mb-3 flex-wrap">
        <Form.Control
          placeholder="Поиск: название, провайдер, теги…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 320 }}
        />

        <Form.Select
          value={cat}
          onChange={(e) => updateCat(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={prov}
          onChange={(e) => setProv(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Все провайдеры</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="title-asc">По названию (А→Я)</option>
          <option value="rtp-desc">По RTP (сначала выше)</option>
        </Form.Select>

        {(q || cat || prov) && (
          <Button variant="outline-secondary" onClick={handleReset}>
            Сбросить
          </Button>
        )}
      </Stack>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {filtered.map((g) => (
          <Col key={g.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <GameCover
                  providerSlug={g.providerSlug}
                  slug={g.slug}
                  alt={`${g.title} cover`}
                />

                <div className="mt-3">
                  <Card.Title className="mb-1">{g.title}</Card.Title>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <Badge
                      bg="light"
                      text="dark"
                      as={Link}
                      to={`/providers/${g.providerSlug}`}
                      className="text-decoration-none text-reset"
                    >
                      {g.provider}
                    </Badge>
                    <Badge bg="secondary">{g.category}</Badge>
                    {g.rtp != null && <Badge bg="dark">RTP {g.rtp}%</Badge>}
                  </div>
                  <Card.Text className="text-muted small mb-3">
                    {g.description}
                  </Card.Text>
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-1">
                    {g.tags?.slice(0, 3).map((t) => (
                      <Badge key={t} bg="outline" className="border text-muted">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    as={Link}
                    to={`/game/${g.providerSlug}/${g.slug}`}
                    size="sm"
                    variant="primary"
                  >
                    Играть
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {filtered.length === 0 && (
          <Col>
            <Card className="border-0 bg-light">
              <Card.Body>
                <div className="text-muted">Ничего не найдено. Попробуй изменить фильтры.</div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
}
