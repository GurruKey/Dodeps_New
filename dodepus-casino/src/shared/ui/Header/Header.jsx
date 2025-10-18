import { useState } from 'react';
import { Navbar, Nav, Button, Badge, Container, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Coins, Sun, Moon, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useAuth, useTheme } from '@/app/providers';

function ThemeToggleButton({ withLabel = false, onAfterToggle, className = '' }) {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Moon : Sun;

  const handleClick = () => {
    toggle();
    if (typeof onAfterToggle === 'function') {
      onAfterToggle();
    }
  };

  const baseClass = withLabel
    ? `d-flex align-items-center justify-content-center gap-2 px-3 py-2 ${className}`.trim()
    : `d-flex align-items-center justify-content-center p-1 ${className}`.trim();

  return (
    <Button
      variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
      size="sm"
      className={baseClass}
      onClick={handleClick}
      aria-label="Переключить тему"
      title={`Переключить на ${theme === 'dark' ? 'светлую' : 'тёмную'} тему`}
      style={withLabel ? undefined : { width: 32, height: 32 }}
    >
      {withLabel ? (
        <span className="d-flex align-items-center justify-content-center gap-2 w-100 text-center">
          <Icon size={16} />
          <span>Тема</span>
        </span>
      ) : (
        <Icon size={16} />
      )}
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stackClass = 'd-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2';

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

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
              <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 w-100 justify-content-md-end">
                <div className="d-flex align-items-center gap-2 justify-content-md-end">
                  <Badge bg="secondary" className="fs-6">
                    {fmtCurrency(balance, currency)}
                  </Badge>
                  {(isAdmin || canAccessAdminPanel?.()) && (
                    <Button as={Link} to="/admin" size="sm" variant="danger">
                      Админ
                    </Button>
                  )}
                  <Button
                    id="header-menu"
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center gap-2"
                    onClick={openMenu}
                  >
                    <MenuIcon size={16} />
                    Меню
                  </Button>
                  <Offcanvas
                    placement="end"
                    show={isMenuOpen}
                    onHide={closeMenu}
                    aria-labelledby="header-menu"
                    style={{ '--bs-offcanvas-width': '180px' }}
                  >
                    <Offcanvas.Header
                      closeButton
                      closeVariant={theme === 'dark' ? 'white' : undefined}
                      className="justify-content-center"
                    >
                      <Offcanvas.Title className="w-100 text-center">Меню</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="d-flex flex-column align-items-center gap-3 text-center h-100 pt-2">
                      <div className="w-100 d-flex flex-column align-items-center">
                        <Badge bg="secondary" className="fs-6 px-3 py-2">
                          {fmtCurrency(balance, currency)}
                        </Badge>
                      </div>
                      <Button
                        as={Link}
                        to="/profile"
                        size="sm"
                        variant="outline-primary"
                        className="w-100"
                        onClick={closeMenu}
                      >
                        Профиль
                      </Button>
                      <Button
                        as={Link}
                        to="/profile/terminal"
                        size="sm"
                        variant="primary"
                        className="w-100"
                        onClick={closeMenu}
                      >
                        Пополнить
                      </Button>
                      <ThemeToggleButton withLabel className="w-100" />
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="w-100 d-flex align-items-center justify-content-center gap-2 mt-auto"
                        onClick={() => {
                          closeMenu();
                          logout();
                        }}
                      >
                        <LogOut size={16} />
                        <span>Выйти</span>
                      </Button>
                    </Offcanvas.Body>
                  </Offcanvas>
                </div>
              </div>
            ) : (
              <>
                <div className={stackClass}>
                  <Button as={Link} to="/login" size="sm" variant="outline-primary">
                    Вход
                  </Button>
                  <Button as={Link} to="/register" size="sm" variant="warning">
                    Регистрация
                  </Button>
                </div>
                <div className="d-flex justify-content-md-end">
                  <ThemeToggleButton />
                </div>
              </>
            )}

          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
