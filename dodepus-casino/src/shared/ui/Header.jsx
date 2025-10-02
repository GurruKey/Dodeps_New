import { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Badge } from 'react-bootstrap';
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
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="Переключить тему"
      title={theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
      style={{ width: 32, height: 32 }}
    >
      <Icon size={16} />
    </Button>
  );
}

function fmtCurrency(v, curr) {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: curr || 'USD' })
      .format(Number(v || 0));
  } catch {
    return `${Number(v || 0).toFixed(2)} ${curr || ''}`;
  }
}

export default function Header() {
  const { isAuthed, isAdmin, user, logout } = useAuth();
  const balance = Number(user?.balance || 0);
  const currency = user?.currency || 'USD';

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      {/* Вся полоса навбара */}
      <div className="w-100 position-relative">
        {/* ЛОГО — снаружи от контейнера, слева */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="position-absolute start-0 top-50 translate-middle-y ms-2 d-flex align-items-center"
          style={{ zIndex: 2 }}
        >
          <Coins size={20} className="me-2" />
          Dodepus Casino
        </Navbar.Brand>

        {/* ПРАВЫЕ КНОПКИ — снаружи контейнера, справа */}
        <div
          className="position-absolute end-0 top-50 translate-middle-y me-2 d-flex align-items-center gap-2"
          style={{ zIndex: 2 }}
        >
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
              {/* 🔴 Админ-панель */}
              {isAdmin && (
                <Button as={Link} to="/admin" size="sm" variant="danger">
                  Админ
                </Button>
              )}
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

        {/* КОНТЕНТНАЯ ЗОНА — только «Слоты» слева и Баланс/Пополнить справа */}
        <div className="container" style={{ paddingLeft: 10, paddingRight: 10 }}>
          <Navbar.Toggle aria-controls="main-nav" className="ms-auto d-md-none my-2" />
          <Navbar.Collapse id="main-nav">
            <div className="d-flex w-100 align-items-center">
              {/* СЛЕВА — Слоты */}
              <Nav className="me-auto">
                <Nav.Link as={Link} to={`/lobby?cat=${encodeURIComponent('Слоты')}`}>
                  Слоты
                </Nav.Link>
              </Nav>

              {/* СПРАВА — Пополнить + Баланс (только для авторизованных) */}
              <div className="ms-auto d-flex align-items-center gap-2">
                {isAuthed && (
                  <>
                    <Button as={Link} to="/profile/terminal" size="sm" variant="primary">
                      Пополнить
                    </Button>
                    <Badge bg="secondary" className="fs-6">
                      {fmtCurrency(balance, currency)}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </Navbar.Collapse>
        </div>
      </div>
    </Navbar>
  );
}
