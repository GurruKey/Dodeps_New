import { pickExtras, saveExtras } from '../profileExtras';

const ensureAuthed = (user) => {
  if (!user?.id) {
    throw new Error('Требуется вход в аккаунт');
  }
};

const persist = (next) => {
  saveExtras(next.id, pickExtras(next));
  return next;
};

export function createUserProfileActions({ user, setUser }) {
  const patchUser = (patch) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      return persist(next);
    });
  };

  const setBalance = (value) => {
    ensureAuthed(user);
    patchUser({ balance: Number(value) || 0 });
  };

  const addBalance = (delta) => {
    ensureAuthed(user);
    setUser((current) => {
      if (!current) return current;
      const next = {
        ...current,
        balance: Math.max(0, (Number(current.balance) || 0) + Number(delta || 0)),
      };
      return persist(next);
    });
  };

  const setCasinoBalance = (value) => {
    ensureAuthed(user);
    patchUser({ casinoBalance: Math.max(0, Number(value) || 0) });
  };

  const addCasinoBalance = (delta) => {
    ensureAuthed(user);
    setUser((current) => {
      if (!current) return current;
      const next = {
        ...current,
        casinoBalance: Math.max(
          0,
          (Number(current.casinoBalance) || 0) + Number(delta || 0)
        ),
      };
      return persist(next);
    });
  };

  const setNickname = (nickname) => {
    ensureAuthed(user);
    patchUser({ nickname: nickname ?? '' });
  };

  const updateProfile = (patch) => {
    ensureAuthed(user);
    patchUser({ ...patch });
  };

  const addTransaction = (txn) => {
    ensureAuthed(user);
    setUser((current) => {
      if (!current) return current;
      const id =
        txn?.id || `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const currency = txn?.currency || current.currency || 'USD';
      const date = txn?.date || new Date().toISOString();
      const status = txn?.status || 'success';
      const type = txn?.type || 'deposit';
      const method = txn?.method || 'other';
      const amount = Number(txn?.amount) || 0;
      const nextTxn = { id, currency, date, status, type, method, amount };
      const next = {
        ...current,
        transactions: [nextTxn, ...(current.transactions || [])],
      };
      return persist(next);
    });
  };

  const addVerificationUpload = (file) => {
    ensureAuthed(user);
    if (!file) return;
    setUser((current) => {
      if (!current) return current;
      const entry = {
        id:
          globalThis.crypto?.randomUUID?.() ??
          `vf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name: file.name ?? 'document',
        type: file.type ?? '',
        size: file.size ?? 0,
        uploadedAt: new Date().toISOString(),
      };
      const next = {
        ...current,
        verificationUploads: [entry, ...(current.verificationUploads || [])],
      };
      return persist(next);
    });
  };

  const setEmailVerified = (flag = true) => {
    ensureAuthed(user);
    patchUser({ emailVerified: !!flag });
  };

  return {
    balance: user?.balance ?? 0,
    casinoBalance: user?.casinoBalance ?? 0,
    setBalance,
    addBalance,
    setCasinoBalance,
    addCasinoBalance,
    setNickname,
    updateProfile,
    addTransaction,
    addVerificationUpload,
    setEmailVerified,
  };
}
