import { Row, Col, Badge } from 'react-bootstrap';
import { games, categories } from '../../../data/games.js';
import GameCard from '../../../shared/ui/GameCard.jsx';

export default function Home() {
  const top = games.slice(0, 6);

  return (
    <>
      <h5 className="mb-2">Категории</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <Badge key={c} bg="secondary">{c}</Badge>
        ))}
      </div>

      <h5 className="mb-3">Популярное</h5>
      <Row xs={2} md={3} lg={4} className="g-3">
        {top.map((g) => (
          <Col key={g.id}>
            <GameCard game={g} />
          </Col>
        ))}
      </Row>
    </>
  );
}
