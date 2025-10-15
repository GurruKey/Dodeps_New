import { forwardRef } from 'react';

const normalizePreview = (preview) => {
  if (!preview || typeof preview !== 'object') {
    return {
      className: 'rank-badge rank-badge--solid',
      style: {},
      textColor: undefined,
    };
  }
  return preview;
};

const RankBadge = forwardRef(function RankBadge(
  { preview, children, className = '', style = {}, pill = true, ...props },
  ref,
) {
  const normalized = normalizePreview(preview);
  const baseClassNames = ['badge'];

  if (pill) {
    baseClassNames.push('rounded-pill');
  }

  baseClassNames.push(normalized.className, className);

  const mergedClassName = baseClassNames.filter(Boolean).join(' ');
  const mergedStyle = { ...(normalized.style ?? {}), ...style };

  return (
    <span ref={ref} className={mergedClassName} style={mergedStyle} {...props}>
      {children}
    </span>
  );
});

export default RankBadge;
