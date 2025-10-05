import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

import Home from '../pages/Home.jsx';
import Lobby from '../pages/Lobby.jsx';
import Game from '../pages/Game.jsx';
import Admin from '../pages/Admin.jsx';
import AdminOverview from '../pages/Admin/overview/index.js';
import AdminClients from '../pages/Admin/clients/index.js';
import AdminPromoCodes from '../pages/Admin/promocodes/index.js';
import AdminPromoCodeCreate from '../pages/Admin/PromoCodeCreate/index.js';
import AdminPromoArchive from '../pages/Admin/PromoArchive/index.js';
import AdminRoles from '../pages/Admin/roles/index.js';
import AdminRoleEdit from '../pages/Admin/RoleEdit/index.js';
import AdminTransactions from '../pages/Admin/transactions/index.js';
import AdminVerification from '../pages/Admin/verification/index.js';
import AdminModeratorsChat from '../pages/Admin/ModeratorsChat/index.js';
import AdminAdministratorsChat from '../pages/Admin/AdministratorsChat/index.js';
import AdminStaffChat from '../pages/Admin/StaffChat/index.js';
import AdminLogAdmin from '../pages/Admin/LogAdmin/index.js';
import ProviderPage from '../pages/Provider.jsx';
import ProvidersPage from '../pages/Providers.jsx';
import CategoriesPage from '../pages/Categories.jsx';
import NotFound from '../pages/NotFound.jsx';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import ProfileLayout from '../pages/profile/layout';
import Personal from '../pages/profile/personal';
import Wallet from '../pages/profile/wallet';
import Terminal from '../pages/profile/terminal';
import History from '../pages/profile/history';
import Verification from '../pages/profile/verification';
import Promos from '../pages/profile/promos';
import Season from '../pages/profile/season';
import GamesHistory from '../pages/profile/games-history';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function RequireAdmin({ children }) {
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

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="promocodes" element={<AdminPromoCodes />} />
        <Route path="promocode-create" element={<AdminPromoCodeCreate />} />
        <Route path="promocode-archive" element={<AdminPromoArchive />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="role-edit" element={<AdminRoleEdit />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="moderators-chat" element={<AdminModeratorsChat />} />
        <Route path="administrators-chat" element={<AdminAdministratorsChat />} />
        <Route path="staff-chat" element={<AdminStaffChat />} />
        <Route path="log-admin" element={<AdminLogAdmin />} />
      </Route>

      {/* Только для авторизованных */}
      <Route
        path="/lobby"
        element={
          <RequireAuth>
            <Lobby />
          </RequireAuth>
        }
      />

      {/* Профиль — layout + вложенные вкладки */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileLayout />
          </RequireAuth>
        }
      >
        {/* redirect /profile -> /profile/personal */}
        <Route index element={<Navigate to="personal" replace />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="history" element={<History />} />
        <Route path="terminal" element={<Terminal />} />
        <Route path="personal" element={<Personal />} />
        <Route path="verification" element={<Verification />} />
        <Route path="promos" element={<Promos />} />
        <Route path="season" element={<Season />} />
        <Route path="games-history" element={<GamesHistory />} />
        {/* будущее: security, notifications и т.п. */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

