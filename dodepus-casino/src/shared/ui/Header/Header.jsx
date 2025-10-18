import { Navbar, Nav, Button, Badge, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Coins, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth, useTheme } from '@/app/providers';

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Moon : Sun;

  return (
    <Button
      variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
      size="sm"
      className="d-flex align-items-center justify-content-center p-1"
      onClick={toggle}
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
  const { isAuthed, isAdmin, canAccessAdminPanel, user, logout } = useAuth();
  const { theme } = useTheme();
  const balance = Number(user?.balance || 0);
  const currency = user?.currency || 'USD';

  const stackClass = 'd-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2';

  return (
    <Navbar bg="body-tertiary" expand="md" sticky="top" data-bs-theme={theme} className="shadow-sm">
      <Container fluid className="py-2">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-semibold">
          <Coins size={20} className="me-2" />
          Dodepus Casino
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" className="ms-auto border-0 shadow-none" />

        <Navbar.Collapse id="main-nav" className="mt-3 mt-md-0">
          <Nav className="me-md-auto">
            <Nav.Link as={Link} to={`/lobby?cat=${encodeURIComponent('Слоты')}`}>
              Слоты
            </Nav.Link>
          </Nav>

          <div className={`${stackClass} ms-md-auto`}> 
            {isAuthed ? (
              <>
                <div className={stackClass}>
                  <Button as={Link} to="/profile" size="sm" variant="outline-primary">
                    Профиль
                  </Button>
                  {(isAdmin || canAccessAdminPanel?.()) && (
                    <Button as={Link} to="/admin" size="sm" variant="danger">
                      Админ
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="d-flex align-items-center justify-content-center p-1"
                    onClick={logout}
                    aria-label="Выйти"
                    title="Выйти"
                    style={{ width: 36, height: 36 }}
                  >
                    <LogOut size={16} />
                  </Button>
                </div>

                <div className={stackClass}>
                  <Button as={Link} to="/profile/terminal" size="sm" variant="primary">
                    Пополнить
                  </Button>
                  <Badge bg="secondary" className="fs-6">
                    {fmtCurrency(balance, currency)}
                  </Badge>
                </div>
              </>
            ) : (
              <div className={stackClass}>
                <Button as={Link} to="/login" size="sm" variant="outline-primary">
                  Вход
                </Button>
                <Button as={Link} to="/register" size="sm" variant="warning">
                  Регистрация
                </Button>
              </div>
            )}

            <div className="d-flex justify-content-md-end">
              <ThemeToggle />
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
