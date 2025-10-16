import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(' ');

export function SidebarNavLink({ item }) {
  const rightContent = typeof item.right === 'function' ? item.right() : item.right;
  const className = joinClassNames(
    item.className,
    rightContent ? 'd-flex justify-content-between align-items-center' : null,
  );
  const labelContent = item.labelClass ? (
    <span className={item.labelClass}>{item.label}</span>
  ) : (
    item.label
  );

  return (
    <Nav.Link as={NavLink} to={item.to} end={item.end} className={className || undefined}>
      {labelContent}
      {rightContent}
    </Nav.Link>
  );
}

export default SidebarNavLink;
