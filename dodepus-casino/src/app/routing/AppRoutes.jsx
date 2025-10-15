import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../../pages/home';
import Lobby from '../../pages/lobby';
import Game from '../../pages/game';
import Admin from '../../pages/admin';
import {
  AdminOverviewPage,
  AdminClientsPage,
  AdminTransactionsPage,
  AdminVerificationPage,
  AdminPromoListPage,
  AdminPromoCreatePage,
  AdminPromoArchivePage,
  AdminRolesPage,
  AdminRoleEditPage,
  AdminRanksPage,
  AdminRankEditPage,
  AdminModeratorsChatPage,
  AdminAdministratorsChatPage,
  AdminStaffChatPage,
  AdminLogPage,
} from '../../pages/admin/features';
import { ProviderDetailsPage, ProvidersListPage } from '../../pages/catalog/providers';
import CategoriesPage from '../../pages/catalog/categories';
import NotFound from '../../pages/not-found';

import Login from '../../pages/auth/login';
import Register from '../../pages/auth/register';

import ProfileLayout from '../../pages/profile/layout';
import Personal from '../../pages/profile/personal';
import Wallet from '../../pages/profile/wallet';
import Terminal from '../../pages/profile/terminal';
import History from '../../pages/profile/history';
import ProfileRank from '../../pages/profile/rank';
import Promos from '../../pages/profile/promos';
import Season from '../../pages/profile/season';
import GamesHistory from '../../pages/profile/games-history';
import ProfileVerification from '../../pages/profile/verification';

import { RequireAdmin, RequireAuth } from './guards';

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
      <Route path="/providers" element={<ProvidersListPage />} />
      <Route path="/providers/:provider" element={<ProviderDetailsPage />} />

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
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="clients" element={<AdminClientsPage />} />
        <Route path="promocodes" element={<AdminPromoListPage />} />
        <Route path="promocode-create" element={<AdminPromoCreatePage />} />
        <Route path="promocode-archive" element={<AdminPromoArchivePage />} />
        <Route path="roles" element={<AdminRolesPage />} />
        <Route path="role-edit" element={<AdminRoleEditPage />} />
        <Route path="ranks" element={<AdminRanksPage />} />
        <Route path="rank-edit" element={<AdminRankEditPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="verification" element={<AdminVerificationPage />} />
        <Route path="moderators-chat" element={<AdminModeratorsChatPage />} />
        <Route path="administrators-chat" element={<AdminAdministratorsChatPage />} />
        <Route path="staff-chat" element={<AdminStaffChatPage />} />
        <Route path="log-admin" element={<AdminLogPage />} />
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
        <Route path="verification" element={<ProfileVerification />} />
        <Route path="rank" element={<ProfileRank />} />
        <Route path="promos" element={<Promos />} />
        <Route path="season" element={<Season />} />
        <Route path="games-history" element={<GamesHistory />} />
        {/* будущее: security, notifications и т.п. */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

