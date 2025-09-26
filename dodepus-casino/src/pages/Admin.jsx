import { Tab, Nav, Row, Col } from 'react-bootstrap';
import AdminClients from './Admin/Clients.jsx';
import AdminPromo from './Admin/Promo.jsx';
import AdminGames from './Admin/Games.jsx';
import AdminTabs from './Admin/Tabs.jsx';

export default function Admin() {
  return (
    <>
      <h2 className="mb-3">Админ-панель</h2>

      <Tab.Container defaultActiveKey="clients">
        <Row className="g-3">
          {/* Левое меню (вкладки) */}
          <Col xs={12} md={3} lg={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item><Nav.Link eventKey="clients">Клиенты</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="promo">Промо</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="games">Игры</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="tabs">Вкладки</Nav.Link></Nav.Item>
            </Nav>
          </Col>

          {/* Контент вкладок */}
          <Col xs={12} md={9} lg={10}>
            <Tab.Content>
              <Tab.Pane eventKey="clients"><AdminClients /></Tab.Pane>
              <Tab.Pane eventKey="promo"><AdminPromo /></Tab.Pane>
              <Tab.Pane eventKey="games"><AdminGames /></Tab.Pane>
              <Tab.Pane eventKey="tabs"><AdminTabs /></Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </>
  );
}
