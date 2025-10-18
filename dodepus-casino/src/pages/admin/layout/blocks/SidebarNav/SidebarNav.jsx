import SidebarNavLink from '../SidebarNavLink/index.js';

export default function SidebarNav({ items = [] }) {
  return (
    <nav aria-label="Админ навигация">
      <div className="d-flex flex-column gap-1">
        {items.map((item) => (
          <SidebarNavLink key={item.key} item={item} />
        ))}
      </div>
    </nav>
  );
}
