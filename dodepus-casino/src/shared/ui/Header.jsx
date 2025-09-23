import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';

export default function Header() {
  const { isAuthed, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      <Container>
        {/* ЛОГО слева */}
        <Navbar.Brand as={Link} to="/">
          <Coins size={20} className="me-2" />
          Dodepus Casino
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          {/* ЛЕВО: один пункт — Слоты */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to={`/lobby?cat=${encodeURIComponent('Слоты')}`}>
              Слоты
            </Nav.Link>
          </Nav>

          {/* ПРАВО: Вход / Регистрация (или Выйти, если авторизован) */}
          <div className="ms-auto d-flex align-items-center gap-2">
            {!isAuthed ? (
              <>
                <Button as={Link} to="/auth" size="sm" variant="outline-light">
                  Вход
                </Button>
                <Button as={Link} to="/auth" size="sm" variant="warning">
                  Регистрация
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline-light" onClick={logout}>
                Выйти
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
