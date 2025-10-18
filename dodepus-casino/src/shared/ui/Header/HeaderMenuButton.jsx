import { useState } from 'react';
import { Button, Offcanvas, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Menu as MenuIcon, LogOut } from 'lucide-react';
import { useTheme } from '@/app/providers';
import ThemeToggleButton from './ThemeToggleButton.jsx';

export default function HeaderMenuButton({ balanceLabel, onLogout }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
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
        show={isOpen}
        onHide={closeMenu}
        aria-labelledby="header-menu"
        style={{ '--bs-offcanvas-width': '240px' }}
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
            <Badge bg="secondary" className="fs-6 w-100 py-2 d-flex justify-content-center">
              {balanceLabel}
            </Badge>
          </div>
          <Button
            as={Link}
            to="/profile"
            size="sm"
            variant="outline-primary"
            className="w-100 py-2"
            onClick={closeMenu}
          >
            Профиль
          </Button>
          <Button
            as={Link}
            to="/profile/terminal"
            size="sm"
            variant="primary"
            className="w-100 py-2"
            onClick={closeMenu}
          >
            Пополнить
          </Button>
          <ThemeToggleButton withLabel className="py-2" />
          <Button
            size="sm"
            variant="outline-danger"
            className="w-100 d-flex align-items-center justify-content-center gap-2 mt-auto"
            onClick={() => {
              closeMenu();
              onLogout();
            }}
          >
            <LogOut size={16} />
            <span>Выйти</span>
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
