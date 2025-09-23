import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

import Home from '../pages/Home.jsx';
import Lobby from '../pages/Lobby.jsx';
import Game from '../pages/Game.jsx';
import Profile from '../pages/Profile.jsx';
import Auth from '../pages/Auth.jsx';
import Admin from '../pages/Admin.jsx';
import ProviderPage from '../pages/Provider.jsx';
import ProvidersPage from '../pages/Providers.jsx';
import CategoriesPage from '../pages/Categories.jsx';
import NotFound from '../pages/NotFound.jsx';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Доступно гостям */}
      <Route path="/game/:provider/:slug" element={<Game />} />
      {/* Временная совместимость со старым путём /game/:slug */}
      <Route path="/game/:slug" element={<Game />} />

      {/* Категории и провайдеры */}
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/providers/:provider" element={<ProviderPage />} />

      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />

      {/* Только для авторизованных */}
      <Route
        path="/lobby"
        element={
          <RequireAuth>
            <Lobby />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
