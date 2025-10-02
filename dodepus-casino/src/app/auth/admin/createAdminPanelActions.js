const getAdminStatus = (user) => {
  if (!user) return false;
  if (typeof user.isAdmin === 'boolean') return user.isAdmin;
  if (Array.isArray(user.roles) && user.roles.includes('admin')) return true;
  if (Array.isArray(user?.app_metadata?.roles) && user.app_metadata.roles.includes('admin')) return true;
  if (user?.user_metadata?.role === 'admin') return true;
  return Boolean(user?.user_metadata?.isAdmin);
};

export function createAdminPanelActions({ user }) {
  const isAdmin = getAdminStatus(user);

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
