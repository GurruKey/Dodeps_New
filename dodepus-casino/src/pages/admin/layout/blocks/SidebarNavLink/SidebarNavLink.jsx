import { NavLink } from 'react-router-dom';

export default function SidebarNavLink({ item }) {
  if (item.type === 'divider') {
    return <div className="border-top my-3" role="separator" />;
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'nav-link px-3 py-2 rounded-3 fw-semibold',
          isActive ? 'bg-warning-subtle text-warning-emphasis' : 'text-body',
        ]
          .filter(Boolean)
          .join(' ')
      }
      end={!item.to?.includes('/')}
    >
      {item.label}
    </NavLink>
  );
}
