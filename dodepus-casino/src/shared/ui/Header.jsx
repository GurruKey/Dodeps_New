import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Coins, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../app/AuthContext.jsx';

function ThemeToggle() {
  const getInitial = () => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const Icon = theme === 'dark' ? Moon : Sun;

  return (
    <Button
      variant="outline-light"
      size="sm"
      className="d-flex align-items-center justify-content-center p-1"
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="Переключить тему"
      title={theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
      style={{ width: 32, height: 32 }}
    >
      <Icon size={16} />
    </Button>
  );
}

export default function Header() {
  const { isAuthed, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      <Container fluid className="px-0">
        {/* ЛОГО слева */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center ps-2">
          <Coins size={20} className="me-2" />
          Dodepus Casino
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" className="me-2" />
        <Navbar.Collapse id="main-nav">
          {/* Левое меню */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to={`/lobby?cat=${encodeURIComponent('Слоты')}`}>
              Слоты
            </Nav.Link>
          </Nav>

          {/* Правый блок */}
          <div className="ms-auto d-flex align-items-center gap-2 pe-2">
            {!isAuthed ? (
              <>
                <Button as={Link} to="/login" size="sm" variant="outline-light">
                  Вход
                </Button>
                <Button as={Link} to="/register" size="sm" variant="warning">
                  Регистрация
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/profile" size="sm" variant="outline-light">
                  Профиль
                </Button>
                <Button
                  size="sm"
                  variant="outline-light"
                  className="d-flex align-items-center justify-content-center p-1"
                  onClick={logout}
                  aria-label="Выйти"
                  title="Выйти"
                  style={{ width: 32, height: 32 }}
                >
                  <LogOut size={16} />
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
