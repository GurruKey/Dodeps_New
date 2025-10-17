import { isAdminUser } from '../composeUser.js';
import { canUserAccessAdminPanel } from './adminPanelVisibility.js';

export function createAdminPanelActions({ user }) {
  const isAdmin = isAdminUser(user);

  const canAccessAdminPanel = () => Boolean(user) && canUserAccessAdminPanel(user);

  const requireAdminAccess = () => {
    if (!user) {
      throw new Error('Требуется вход в аккаунт для доступа к админ-панели.');
    }
    if (!canAccessAdminPanel()) {
      throw new Error('Недостаточно прав для доступа к админ-панели.');
    }
  };

  return {
    isAdmin,
    canAccessAdminPanel,
    requireAdminAccess,
  };
}
