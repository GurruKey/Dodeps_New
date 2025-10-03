import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

import Home from '../pages/Home.jsx';
import Lobby from '../pages/Lobby.jsx';
import Game from '../pages/Game.jsx';
import Admin from '../pages/Admin.jsx';
import AdminOverview from '../pages/Admin/overview';
import AdminClients from '../pages/Admin/clients';
import AdminPromoCodes from '../pages/Admin/promocodes';
import AdminRoles from '../pages/Admin/roles';
import RolesAssign from '../pages/Admin/roles/AssignRole.jsx';
import RolesEdit from '../pages/Admin/roles/EditRole.jsx';
import RolesTransactions from '../pages/Admin/roles/Transactions.jsx';
import RolesVerification from '../pages/Admin/roles/Verification.jsx';
import RolesModerationChat from '../pages/Admin/roles/ModerationChat.jsx';
import RolesAdminChat from '../pages/Admin/roles/AdminChat.jsx';
import ProviderPage from '../pages/Provider.jsx';
import ProvidersPage from '../pages/Providers.jsx';
import CategoriesPage from '../pages/Categories.jsx';
import NotFound from '../pages/NotFound.jsx';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import ProfileLayout from '../pages/profile/ProfileLayout.jsx';
import Personal from '../pages/profile/Personal.jsx';
import Wallet from '../pages/profile/Wallet.jsx';
import Terminal from '../pages/profile/Terminal.jsx';
import History from '../pages/profile/History.jsx';
import Verification from '../pages/profile/Verification.jsx';
import Promos from '../pages/profile/Promos.jsx';
import Season from '../pages/profile/Season.jsx';
import GamesHistory from '../pages/profile/GamesHistory.jsx';

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
        <Route path="roles" element={<AdminRoles />}>
          <Route index element={<Navigate to="assign" replace />} />
          <Route path="assign" element={<RolesAssign />} />
          <Route path="edit" element={<RolesEdit />} />
          <Route path="transactions" element={<RolesTransactions />} />
          <Route path="verification" element={<RolesVerification />} />
          <Route path="moderation-chat" element={<RolesModerationChat />} />
          <Route path="admin-chat" element={<RolesAdminChat />} />
        </Route>
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
