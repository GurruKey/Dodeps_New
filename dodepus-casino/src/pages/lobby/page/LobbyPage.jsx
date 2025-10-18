import { useMemo, useState, useEffect } from 'react';
import { Row, Col, Form, Button, Stack } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { games, categories, providers } from '@/data';
import { GameCard } from '@/shared/ui';

export default function LobbyPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('cat') || '';
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(initialCat);
  const [prov, setProv] = useState('');
  const [sort, setSort] = useState('title-asc');

  useEffect(() => {
    const nextCat = searchParams.get('cat') || '';
    setCat(nextCat);
  }, [searchParams]);

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
            <option key={c} value={c}>{c}</option>
          ))}
        </Form.Select>

        <Form.Select
          value={prov}
          onChange={(e) => setProv(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Все провайдеры</option>
          {providers.map((p) => (
            <option key={p} value={p}>{p}</option>
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

      <Row xs={2} md={3} lg={4} className="g-3">
        {filtered.map((g) => (
          <Col key={g.id}>
            <GameCard game={g} />
          </Col>
        ))}

        {filtered.length === 0 && (
          <Col>
            <div className="text-muted">Ничего не найдено. Попробуй изменить фильтры.</div>
          </Col>
        )}
      </Row>
    </>
  );
}
