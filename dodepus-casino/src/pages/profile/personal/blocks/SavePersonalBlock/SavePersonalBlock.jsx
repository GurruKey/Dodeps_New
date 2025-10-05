import { useEffect, useRef, useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { Save } from 'lucide-react';

export default function SavePersonalBlock({ onSave, disabled = false }) {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const dirtySetRef = useRef(new Set());

  useEffect(() => {
    const onDirty = (e) => {
      const id = e?.detail?.id;
      const dirty = !!e?.detail?.dirty;
      if (!id) return;
      const s = dirtySetRef.current;
      if (dirty) s.add(id);
      else s.delete(id);
      setHasChanges(s.size > 0);
    };
    const onSavedExternal = () => {
      dirtySetRef.current.clear();
      setHasChanges(false);
    };
    window.addEventListener('personal:dirty', onDirty);
    window.addEventListener('personal:saved', onSavedExternal);
    return () => {
      window.removeEventListener('personal:dirty', onDirty);
      window.removeEventListener('personal:saved', onSavedExternal);
    };
  }, []);

  const handleClick = async () => {
    if (saving || disabled || !hasChanges) return;
    setSaving(true);
    try {
      if (typeof onSave === 'function') await onSave();
      else window.dispatchEvent(new CustomEvent('personal:save'));
      window.dispatchEvent(new CustomEvent('personal:saved'));
      dirtySetRef.current.clear();
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = disabled || saving || !hasChanges;
  const variant = isDisabled ? 'secondary' : 'success';

  return (
    <Card>
      <Card.Body className="d-flex flex-column align-items-center text-center gap-2">
        <Card.Title className="mb-1">Сохранение</Card.Title>
        <div className="text-secondary small mb-2">
          Применяет изменения из всех блоков персональных данных.
        </div>
        <Button onClick={handleClick} disabled={isDisabled} variant={variant} className="px-4">
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Сохраняю…
            </>
          ) : (
            <>
              <Save size={18} className="me-2" />
              Сохранить изменения
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
}
