import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuth, useTheme } from '@/app/providers';
import ThemeToggleButton from './ThemeToggleButton.jsx';
import HeaderMenuActions from './HeaderMenuActions.jsx';

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
  const formattedBalance = fmtCurrency(balance, currency);

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
                <HeaderMenuActions
                  balanceLabel={formattedBalance}
                  showAdminLink={Boolean(isAdmin || canAccessAdminPanel?.())}
                  onLogout={logout}
                />
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
