import { createProfileActions as createSimProfileActions } from '../../../../local-sim/auth/profileActions';

const ensureAuthed = (user) => {
  if (!user?.id) {
    throw new Error('Требуется вход в аккаунт');
  }
  return user;
};

export function createUserProfileActions({ user, setUser }) {
  const syncExtras = (perform) => {
    const authedUser = ensureAuthed(user);
    const actions = createSimProfileActions(authedUser.id);
    const nextExtras = perform(actions);

    if (!nextExtras) return nextExtras;

    setUser((current) => {
      if (!current) return current;
      return { ...current, ...nextExtras };
    });

    return nextExtras;
  };

  const setBalance = (value) => syncExtras((actions) => actions.setBalance(value));

  const addBalance = (delta) => syncExtras((actions) => actions.addBalance(delta));

  const setCasinoBalance = (value) =>
    syncExtras((actions) => actions.setCasinoBalance(value));

  const addCasinoBalance = (delta) =>
    syncExtras((actions) => actions.addCasinoBalance(delta));

  const setNickname = (nickname) => syncExtras((actions) => actions.setNickname(nickname));

  const updateProfile = (patch) => syncExtras((actions) => actions.updateProfile(patch));

  const addTransaction = (txn) => syncExtras((actions) => actions.addTransaction(txn));

  const addVerificationUpload = (file) =>
    syncExtras((actions) => actions.addVerificationUpload(file));

  const submitVerificationRequest = (statusMap) =>
    syncExtras((actions) => actions.submitVerificationRequest(statusMap));

  const setEmailVerified = (flag = true) =>
    syncExtras((actions) => actions.setEmailVerified(flag));

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
    submitVerificationRequest,
    setEmailVerified,
  };
}
