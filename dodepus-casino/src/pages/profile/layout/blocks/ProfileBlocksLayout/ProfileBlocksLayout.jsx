import { createElement } from 'react';

export function ProfileBlocksLayout({
  as: Component = 'div',
  gap = 3,
  className = '',
  children,
}) {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;
  const classes = ['d-grid', gapClass, className].filter(Boolean).join(' ');

  return createElement(Component, { className: classes }, children);
}

export default ProfileBlocksLayout;
