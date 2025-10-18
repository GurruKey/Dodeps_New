import { Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import HeaderMenuButton from './HeaderMenuButton.jsx';

export default function HeaderMenuActions({ balanceLabel, showAdminLink, onLogout }) {
  return (
    <div className="d-flex align-items-center gap-2 justify-content-md-end flex-wrap">
      <Badge bg="secondary" className="fs-6">
        {balanceLabel}
      </Badge>
      {showAdminLink && (
        <Button as={Link} to="/admin" size="sm" variant="danger">
          Админ
        </Button>
      )}
      <HeaderMenuButton balanceLabel={balanceLabel} onLogout={onLogout} />
    </div>
  );
}
