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
  AdminRankEditorPage,
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

import {
  ProfileLayout,
  ProfilePersonalPage,
  ProfileWalletPage,
  ProfileTerminalPage,
  ProfileHistoryPage,
  ProfileRankPage,
  ProfilePromosPage,
  ProfileSeasonPage,
  ProfileGamesHistoryPage,
  ProfileVerificationPage,
} from '../../pages/profile';

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
        <Route path="rank-editor" element={<AdminRankEditorPage />} />
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
        <Route path="wallet" element={<ProfileWalletPage />} />
        <Route path="history" element={<ProfileHistoryPage />} />
        <Route path="terminal" element={<ProfileTerminalPage />} />
        <Route path="personal" element={<ProfilePersonalPage />} />
        <Route path="verification" element={<ProfileVerificationPage />} />
        <Route path="rank" element={<ProfileRankPage />} />
        <Route path="promos" element={<ProfilePromosPage />} />
        <Route path="season" element={<ProfileSeasonPage />} />
        <Route path="games-history" element={<ProfileGamesHistoryPage />} />
        {/* будущее: security, notifications и т.п. */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

