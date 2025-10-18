import { useMemo } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

import { useAuth } from '@/app/providers';
import { SidebarNav } from './blocks/index.js';
import { createNavItems } from './createNavItems.js';
import {
  availableRoles,
  rolePermissionMatrix,
} from '@local-sim/modules/access/index.js';

export default function AdminLayout({ clients, isLoading, error, onReload }) {
  const { user } = useAuth();

  const visibleNavItems = useMemo(
    () =>
      createNavItems({
        user,
        availableRoles,
        rolePermissionMatrix,
      }),
    [user],
  );

  return (
    <Container className="mb-4">
      <h2 className="mb-3">Админ-панель</h2>
      <Row className="g-3">
        <Col xs={12} md={3} lg={2}>
          <Card className="h-100">
            <Card.Body className="p-3">
              <SidebarNav items={visibleNavItems} />
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

