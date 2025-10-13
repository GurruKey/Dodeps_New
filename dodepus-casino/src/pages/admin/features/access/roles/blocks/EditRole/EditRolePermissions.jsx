import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Form, Modal, Stack } from 'react-bootstrap';
import {
  availableRoles,
  rolePermissionMatrix,
  roleMatrixLegend,
} from '../../data/roleConfigs.js';
import {
  resolveCategoryKey,
  roleGroups,
  roleGroupsByKey,
} from './roleGroups/index.js';
import {
  ADMIN_PANEL_VISIBILITY_EVENT,
  loadAdminPanelVisibility,
  setAdminPanelVisibilityForRole,
} from '../../../../../../../../local-sim/auth/admin/adminPanelVisibility.js';
import { appendRolePermissionLog } from '../../../../../../../../local-sim/admin/features/access/rolePermissionLogs.js';

const permissionKeys = Object.keys(roleMatrixLegend);

export default function EditRolePermissions() {
  const initialVisibility = useMemo(() => loadAdminPanelVisibility(), []);
  const roleMetadata = useMemo(() => {
    const map = new Map();
    availableRoles.forEach((role) => {
      map.set(role.id, role);
    });
    return map;
  }, []);

  const [adminVisibility, setAdminVisibility] = useState(initialVisibility);
  const [matrix, setMatrix] = useState(() =>
    rolePermissionMatrix.map((role) => ({
      ...role,
      permissions: {
        ...role.permissions,
        adminPanel:
          initialVisibility[role.roleId] ?? role.permissions.adminPanel ?? false,
      },
    }))
  );
  const [activeCategory, setActiveCategory] = useState(roleGroups[0].key);
  const [expandedRoles, setExpandedRoles] = useState([]);
  const [pendingChange, setPendingChange] = useState(null);

  useEffect(() => {
    const target = typeof window !== 'undefined' ? window : globalThis;
    if (!target?.addEventListener) return undefined;

    const handleVisibilityChange = (event) => {
      const nextVisibility =
        event?.detail?.visibility && typeof event.detail.visibility === 'object'
          ? event.detail.visibility
          : loadAdminPanelVisibility();

      setAdminVisibility((prev) => ({ ...prev, ...nextVisibility }));
    };

    target.addEventListener(ADMIN_PANEL_VISIBILITY_EVENT, handleVisibilityChange);
    return () => {
      target.removeEventListener(ADMIN_PANEL_VISIBILITY_EVENT, handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setMatrix((prev) =>
      prev.map((role) => ({
        ...role,
        permissions: {
          ...role.permissions,
          adminPanel:
            adminVisibility[role.roleId] ?? role.permissions.adminPanel ?? false,
        },
      }))
    );
  }, [adminVisibility]);

  const categorizedRoles = useMemo(() => {
    const groups = roleGroups.reduce((acc, category) => {
      acc[category.key] = [];
      return acc;
    }, {});

    matrix.forEach((role) => {
      const meta = roleMetadata.get(role.roleId) ?? null;
      const categoryKey = resolveCategoryKey(meta?.group);
      const targetKey = groups[categoryKey] ? categoryKey : roleGroups[roleGroups.length - 1].key;

      groups[targetKey].push({
        ...role,
        meta,
      });
    });

    return groups;
  }, [matrix, roleMetadata]);

  const handleCategoryChange = (categoryKey) => {
    if (categoryKey === activeCategory) return;
    setActiveCategory(categoryKey);
    setExpandedRoles([]);
  };

  const handleAccordionSelect = (eventKey) => {
    if (!eventKey) {
      setExpandedRoles([]);
      return;
    }

    if (Array.isArray(eventKey)) {
      setExpandedRoles(eventKey.filter(Boolean));
      return;
    }

    const key = String(eventKey);

    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return Array.from(next);
    });
  };

  const handleCloseModal = () => {
    setPendingChange(null);
  };

  const requestPermissionToggle = (event, role, permissionKey) => {
    event.preventDefault();
    event.stopPropagation();

    const currentValue = role.permissions[permissionKey] ?? false;
    const permissionLabel = roleMatrixLegend[permissionKey] ?? permissionKey;

    setPendingChange({
      type: 'single',
      roleId: role.roleId,
      roleName: role.roleName,
      permissionKey,
      permissionLabel,
      currentValue,
      nextValue: !currentValue,
    });
  };

  const requestToggleAllPermissions = (event, role, nextValue) => {
    event.preventDefault();
    event.stopPropagation();

    const permissionsToUpdate = permissionKeys
      .map((permissionKey) => ({
        key: permissionKey,
        label: roleMatrixLegend[permissionKey] ?? permissionKey,
        previousValue: role.permissions[permissionKey] ?? false,
      }))
      .filter((permission) => permission.previousValue !== nextValue);

    if (permissionsToUpdate.length === 0) {
      return;
    }

    setPendingChange({
      type: 'bulk',
      roleId: role.roleId,
      roleName: role.roleName,
      permissions: permissionsToUpdate,
      nextValue,
    });
  };

  const handleConfirmChange = (comment) => {
    if (!pendingChange) return;

    if (pendingChange.type === 'bulk') {
      const { roleId, roleName, permissions, nextValue } = pendingChange;

      setMatrix((prev) =>
        prev.map((role) =>
          role.roleId === roleId
            ? {
                ...role,
                permissions: {
                  ...role.permissions,
                  ...permissions.reduce(
                    (acc, permission) => {
                      acc[permission.key] = nextValue;
                      return acc;
                    },
                    {},
                  ),
                },
              }
            : role,
        ),
      );

      if (permissions.some((permission) => permission.key === 'adminPanel')) {
        setAdminPanelVisibilityForRole(roleId, nextValue);
        setAdminVisibility((prev) => ({ ...prev, [roleId]: nextValue }));
      }

      permissions.forEach((permission) => {
        appendRolePermissionLog({
          roleId,
          roleName,
          permissionKey: permission.key,
          permissionLabel: permission.label,
          previousValue: permission.previousValue,
          nextValue,
          comment,
        });
      });
    } else {
      const { roleId, roleName, permissionKey, permissionLabel, currentValue, nextValue } =
        pendingChange;

      if (permissionKey === 'adminPanel') {
        setAdminPanelVisibilityForRole(roleId, nextValue);
        setAdminVisibility((prev) => ({ ...prev, [roleId]: nextValue }));
      }

      setMatrix((prev) =>
        prev.map((role) =>
          role.roleId === roleId
            ? {
                ...role,
                permissions: {
                  ...role.permissions,
                  [permissionKey]: nextValue,
                },
              }
            : role,
        ),
      );

      appendRolePermissionLog({
        roleId,
        roleName,
        permissionKey,
        permissionLabel,
        previousValue: currentValue,
        nextValue,
        comment,
      });
    }

    handleCloseModal();
  };

  const activeRoles = categorizedRoles[activeCategory] ?? [];

  return (
    <Card>
      <Card.Body>
        <Stack gap={4}>
          <div>
            <Card.Title as="h4" className="mb-1">
              Изменить роль
            </Card.Title>
            <Card.Text className="text-muted mb-0">
              Выберите группу слева направо и раскрывайте роли, чтобы управлять отдельными
              разрешениями. Каждое изменение требует комментария и сразу попадает в локальный лог.
            </Card.Text>
          </div>

          <div>
            <Card.Subtitle className="fw-semibold text-uppercase text-muted mb-2">
              Группы ролей
            </Card.Subtitle>
            <div className="d-flex flex-wrap gap-2">
              {roleGroups.map((category) => {
                const count = categorizedRoles[category.key]?.length ?? 0;
                const isActive = category.key === activeCategory;
                return (
                  <Button
                    key={category.key}
                    variant={isActive ? 'primary' : 'outline-secondary'}
                    onClick={() => handleCategoryChange(category.key)}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <span>{category.label}</span>
                      <Badge bg={isActive ? 'light' : 'secondary'} className={isActive ? 'text-dark' : ''}>
                        {count}
                      </Badge>
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Card.Subtitle className="fw-semibold text-uppercase text-muted mb-2">
              {roleGroupsByKey[activeCategory]?.label ?? 'Роли'}
            </Card.Subtitle>
            {(() => {
              const ActiveGroupComponent = roleGroupsByKey[activeCategory]?.Component ?? null;
              if (!ActiveGroupComponent) {
                return (
                  <Card className="border-0 surface-card">
                    <Card.Body className="py-4 text-center text-muted">
                      Нет доступных ролей в выбранной группе.
                    </Card.Body>
                  </Card>
                );
              }

              return (
                <ActiveGroupComponent
                  roles={activeRoles}
                  permissionKeys={permissionKeys}
                  roleMatrixLegend={roleMatrixLegend}
                  expandedRoles={expandedRoles}
                  onToggleRole={handleAccordionSelect}
                  onRequestPermissionToggle={requestPermissionToggle}
                  onRequestToggleAll={requestToggleAllPermissions}
                />
              );
            })()}
          </div>
        </Stack>
      </Card.Body>

      <ConfirmChangeModal
        pendingChange={pendingChange}
        onCancel={handleCloseModal}
        onConfirm={handleConfirmChange}
      />
    </Card>
  );
}

function ConfirmChangeModal({ pendingChange, onCancel, onConfirm }) {
  const [commentValue, setCommentValue] = useState('');

  useEffect(() => {
    if (pendingChange) {
      setCommentValue('');
    }
  }, [pendingChange]);

  const isBulkChange = pendingChange?.type === 'bulk';
  const actionLabel = isBulkChange
    ? pendingChange?.nextValue
      ? 'Включить все доступы'
      : 'Отключить все доступы'
    : pendingChange?.nextValue
    ? `Включить «${pendingChange?.permissionLabel ?? ''}»`
    : `Отключить «${pendingChange?.permissionLabel ?? ''}»`;

  const handleSubmit = (event) => {
    event.preventDefault();
    const comment = commentValue.trim();
    if (!comment) return;
    onConfirm(comment);
  };

  return (
    <Modal show={Boolean(pendingChange)} onHide={onCancel} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение изменения</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap={3}>
            <div>
              <div className="fw-semibold">{pendingChange?.roleName}</div>
              <div className="text-muted small">{actionLabel}</div>
              {isBulkChange && pendingChange?.permissions?.length ? (
                <ul className="small text-muted mt-2 mb-0 ps-3">
                  {pendingChange.permissions.map((permission) => (
                    <li key={permission.key}>{permission.label}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Form.Group controlId="role-permission-comment">
              <Form.Label>Комментарий</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={commentValue}
                onChange={(event) => setCommentValue(event.target.value)}
                placeholder="Опишите причину изменения доступа"
                autoFocus
              />
              <Form.Text className="text-muted">
                Запись об изменении сохранится через локальный симулятор сразу после подтверждения.
              </Form.Text>
            </Form.Group>
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={!commentValue.trim()}>
            Подтвердить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

