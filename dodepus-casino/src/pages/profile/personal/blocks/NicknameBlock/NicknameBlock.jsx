import { useState, useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAuth } from '@/app/providers';
import { useVerificationModules, computeModuleLocks } from '@/shared/verification';

export default function NicknameBlock() {
  const { user, updateProfile } = useAuth();
  const verification = useVerificationModules(user);
  const locks = computeModuleLocks(verification?.modules ?? {});
  const nicknameLocked = locks.nickname;

  const [nickname, setNickname] = useState(user?.nickname ?? '');

  useEffect(() => setNickname(user?.nickname ?? ''), [user?.nickname]);

  const changed = !nicknameLocked && nickname !== (user?.nickname ?? '');

  useEffect(() => {
    const id = 'block:nickname';
    window.dispatchEvent(
      new CustomEvent('personal:dirty', { detail: { id, dirty: Boolean(changed) } }),
    );
    return () =>
      window.dispatchEvent(
        new CustomEvent('personal:dirty', { detail: { id, dirty: false } }),
      );
  }, [changed]);

  useEffect(() => {
    const onSave = () => {
      if (!changed || nicknameLocked) return;
      updateProfile({
        nickname: (nickname || '').trim(),
      });
    };
    window.addEventListener('personal:save', onSave);
    return () => window.removeEventListener('personal:save', onSave);
  }, [changed, nickname, updateProfile, nicknameLocked]);

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-3">Никнейм</Card.Title>
        <Form.Group controlId="profile-nickname">
          <Form.Label>Никнейм</Form.Label>
          <Form.Control
            type="text"
            placeholder="AcePlayer"
            value={nickname}
            onChange={(event) => {
              if (nicknameLocked) return;
              setNickname(event.target.value);
            }}
            disabled={nicknameLocked}
          />
        </Form.Group>
        {nicknameLocked ? (
          <div className="text-secondary small mt-3">
            Ник заблокирован: он используется в истории игр и публичном профиле.
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
