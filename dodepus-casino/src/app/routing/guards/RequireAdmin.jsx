import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers';

export function RequireAdmin({ children }) {
  const { isAuthed, canAccessAdminPanel } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessAdminPanel?.()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
