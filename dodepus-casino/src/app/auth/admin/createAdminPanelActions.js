import { isAdminUser } from '../../../../local-sim/auth/composeUser';

export function createAdminPanelActions({ user }) {
  const isAdmin = isAdminUser(user);

  const requireAdminAccess = () => {
    if (!user) {
      throw new Error('Требуется вход в аккаунт для доступа к админ-панели.');
    }
    if (!isAdmin) {
      throw new Error('Недостаточно прав для доступа к админ-панели.');
    }
  };

  const canAccessAdminPanel = () => Boolean(user) && isAdmin;

  return {
    isAdmin,
    canAccessAdminPanel,
    requireAdminAccess,
  };
}
