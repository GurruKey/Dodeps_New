import { Button } from 'react-bootstrap';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/providers';

export default function ThemeToggleButton({ withLabel = false, onAfterToggle, className = '' }) {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Moon : Sun;

  const handleClick = () => {
    toggle();
    if (typeof onAfterToggle === 'function') {
      onAfterToggle();
    }
  };

  const baseClass = [
    'd-flex align-items-center justify-content-center',
    withLabel ? 'gap-2 w-100 py-2' : 'p-1',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Button
      variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
      size="sm"
      className={baseClass}
      onClick={handleClick}
      aria-label="Переключить тему"
      title={`Переключить на ${theme === 'dark' ? 'светлую' : 'тёмную'} тему`}
      style={withLabel ? undefined : { width: 32, height: 32 }}
    >
      {withLabel ? (
        <span className="d-flex align-items-center justify-content-center gap-2 w-100 text-center">
          <Icon size={16} />
          <span>Тема</span>
        </span>
      ) : (
        <Icon size={16} />
      )}
    </Button>
  );
}
