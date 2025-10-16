export function ProfileBlocksLayout({
  as: Component = 'div',
  gap = 3,
  className = '',
  children,
}) {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;
  const classes = ['d-grid', gapClass, className].filter(Boolean).join(' ');

  return <Component className={classes}>{children}</Component>;
}

export default ProfileBlocksLayout;
