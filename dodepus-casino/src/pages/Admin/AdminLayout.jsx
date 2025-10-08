import { useEffect, useMemo } from 'react';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../../app/AuthContext.jsx';
import { availableRoles, rolePermissionMatrix } from './roles/data/roleConfigs.js';
import { useAdminVerificationRequests } from './verification/hooks/useAdminVerificationRequests.js';
import { getInReviewVerificationTextClass } from './verification/utils.js';

const NAV_ITEMS = [
  { key: 'overview', to: 'overview', label: 'Обзор', permission: 'overview' },
  { key: 'clients', to: 'clients', label: 'Клиенты', permission: 'clients' },
  { key: 'transactions', to: 'transactions', label: 'Транзакции', permission: 'transactions' },
  { key: 'verification', to: 'verification', label: 'Верификация', permission: 'verification' },
  { key: 'divider-1', type: 'divider' },
  { key: 'promocodes', to: 'promocodes', label: 'Promo', permission: 'promocodes' },
  {
    key: 'promocode-create',
    to: 'promocode-create',
    label: 'Создать Promo',
    permission: 'promocodes',
  },
  {
    key: 'promocode-archive',
    to: 'promocode-archive',
    label: 'Архив Promo',
    permission: 'promocodes',
  },
  { key: 'divider-2', type: 'divider' },
  { key: 'roles', to: 'roles', label: 'Выдать роль', permission: 'roles' },
  { key: 'role-edit', to: 'role-edit', label: 'Изменить роль', permission: 'roles' },
  { key: 'divider-3', type: 'divider' },
  { key: 'moderators-chat', to: 'moderators-chat', label: 'Модератор Чат', permission: 'chat' },
  { key: 'administrators-chat', to: 'administrators-chat', label: 'Админ Чат', permission: 'chat' },
  { key: 'staff-chat', to: 'staff-chat', label: 'Стаф Чат', permission: 'chat' },
  { key: 'divider-4', type: 'divider' },
  { key: 'log-admin', to: 'log-admin', label: 'Log Admin', permission: 'adminPanel' },
];

const permissionByRoleId = rolePermissionMatrix.reduce((acc, role) => {
  if (!role?.roleId) return acc;
  acc.set(role.roleId, role.permissions ?? {});
  return acc;
}, new Map());

const normalizedRoles = availableRoles.map((role) => ({
  id: typeof role?.id === 'string' ? role.id.trim() : '',
  group: typeof role?.group === 'string' ? role.group.trim().toLowerCase() : '',
  level:
    typeof role?.level === 'number' && Number.isFinite(role.level) ? role.level : null,
}));

const normalizeRoleId = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
};

const normalizeRoleGroup = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toLowerCase();
  return trimmed ? trimmed : '';
};

const collectCandidateRoleIds = (user) => {
  if (!user) return [];

  const candidates = [];
  const pushCandidate = (value) => {
    const normalized = normalizeRoleId(value);
    if (!normalized) return;
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  pushCandidate(user.roleId);
  pushCandidate(user?.user_metadata?.roleId);
  pushCandidate(user?.app_metadata?.roleId);

  if (Array.isArray(user?.roles)) {
    user.roles.forEach(pushCandidate);
  }

  const groups = new Set();
  [user?.role, user?.user_metadata?.role, user?.app_metadata?.role]
    .map(normalizeRoleGroup)
    .filter(Boolean)
    .forEach((group) => {
      groups.add(group);
    });

  const levels = new Set();
  [
    user?.roleLevel,
    user?.user_metadata?.roleLevel,
    user?.user_metadata?.level,
    user?.app_metadata?.roleLevel,
    user?.app_metadata?.level,
  ].forEach((value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      levels.add(value);
    }
  });

  normalizedRoles.forEach((role) => {
    if (!role.id || candidates.includes(role.id)) return;
    if (!groups.has(role.group)) return;

    if (role.level !== null) {
      if (levels.has(role.level)) {
        candidates.push(role.id);
      }
      return;
    }

    candidates.push(role.id);
  });

  return candidates;
};

const resolvePermissionsForUser = (user) => {
  if (!user) return null;
  const roleIds = collectCandidateRoleIds(user);

  for (const roleId of roleIds) {
    const permissions = permissionByRoleId.get(roleId);
    if (permissions) {
      return permissions;
    }
  }

  return null;
};

export default function AdminLayout({ clients, isLoading, error, onReload }) {
  const { user } = useAuth();
  const {
    requests: verificationRequests,
    ensureLoaded: ensureVerificationRequestsLoaded,
  } = useAdminVerificationRequests();

  const inReviewVerificationCount = useMemo(() => {
    if (!Array.isArray(verificationRequests)) {
      return 0;
    }

    return verificationRequests.reduce(
      (acc, request) => (request?.status === 'pending' ? acc + 1 : acc),
      0,
    );
  }, [verificationRequests]);

  const inReviewVerificationClassName =
    getInReviewVerificationTextClass(inReviewVerificationCount);

  const permissions = useMemo(() => resolvePermissionsForUser(user), [user]);

  const visibleNavItems = useMemo(() => {
    const allowedItems = NAV_ITEMS.filter((item) => {
      if (item.type === 'divider') {
        return true;
      }

      if (!item.permission) return true;

      if (permissions) {
        return Boolean(permissions[item.permission]);
      }

      if (user?.isAdmin) {
        return true;
      }

      return false;
    });

    const cleanedItems = allowedItems.reduce((acc, item, index) => {
      if (item.type !== 'divider') {
        acc.push(item);
        return acc;
      }

      if (acc.length === 0) {
        return acc;
      }

      const hasNextSection = allowedItems.slice(index + 1).some((candidate) => candidate.type !== 'divider');
      if (!hasNextSection) {
        return acc;
      }

      if (acc[acc.length - 1]?.type === 'divider') {
        return acc;
      }

      acc.push(item);
      return acc;
    }, []);

    if (cleanedItems.length > 0) {
      return cleanedItems;
    }

    return NAV_ITEMS.filter((item) => item.key === 'overview');
  }, [permissions, user?.isAdmin]);

  const hasVerificationAccess = useMemo(
    () => visibleNavItems.some((item) => item.key === 'verification'),
    [visibleNavItems],
  );

  useEffect(() => {
    if (!hasVerificationAccess) {
      return;
    }

    const maybePromise = ensureVerificationRequestsLoaded?.();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {});
    }
  }, [ensureVerificationRequestsLoaded, hasVerificationAccess]);

  return (
    <Container className="mb-4">
      <h2 className="mb-3">Админ-панель</h2>
      <Row className="g-3">
        <Col xs={12} md={3} lg={2}>
          <Card className="h-100">
            <Card.Body className="p-3">
              <Nav variant="pills" className="flex-column gap-1">
                {visibleNavItems.map((item) =>
                  item.type === 'divider' ? (
                    <div key={item.key} className="border-top my-2" role="presentation" />
                  ) : (
                    <Nav.Link key={item.key} as={NavLink} to={item.to} end>
                      <span className="d-flex align-items-center justify-content-between w-100">
                        <span>{item.label}</span>
                        {item.key === 'verification' && (
                          <span className={`fw-semibold small ${inReviewVerificationClassName}`}>
                            {inReviewVerificationCount}
                          </span>
                        )}
                      </span>
                    </Nav.Link>
                  ),
                )}
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={9} lg={10}>
          <Outlet context={{ clients, isLoading, error, onReload }} />
        </Col>
      </Row>
    </Container>
  );
}

