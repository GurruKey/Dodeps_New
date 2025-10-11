export const MODULE_LOCK_HINT = 'Поля временно заблокированы до завершения проверки.';

export const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const hasUploadWithCategory = (uploads, category) => {
  const target = String(category || '').toLowerCase();
  if (!target) {
    return false;
  }

  return uploads.some((upload) => {
    const raw =
      upload?.verificationCategory ||
      upload?.verificationKind ||
      upload?.category ||
      upload?.kind;
    return String(raw).toLowerCase() === target;
  });
};

const computePhoneDigits = (value) => (value ? String(value).replace(/\D/g, '') : '');

export const createModuleContext = (userInput, uploadsInput) => {
  const user = userInput || {};
  const uploads = Array.isArray(uploadsInput) ? uploadsInput : [];

  const emailValue = normalizeString(user.email);
  const phoneDigits = computePhoneDigits(user.phone);
  const genderValue = normalizeString(user.gender).toLowerCase();

  const hasEmailValue = emailValue.length >= 3;
  const hasPhoneValue = phoneDigits.length >= 10;
  const hasPersonalData =
    normalizeString(user.firstName).length >= 2 &&
    normalizeString(user.lastName).length >= 2 &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(user.dob || '')) &&
    (genderValue === 'male' || genderValue === 'female');
  const hasAddressFields = ['country', 'city', 'address'].every((key) =>
    normalizeString(user[key]).length >= 2,
  );
  const hasAddressUpload = hasUploadWithCategory(uploads, 'address');
  const hasIdentityUpload = hasUploadWithCategory(uploads, 'identity');

  const readiness = {
    email: hasEmailValue,
    phone: hasPhoneValue,
    address: hasAddressFields && hasPersonalData && hasAddressUpload,
    doc: hasPersonalData && hasIdentityUpload,
  };

  const requirements = {
    hasEmailValue,
    hasPhoneValue,
    hasPersonalData,
    hasAddressFields,
    hasAddressUpload,
    hasIdentityUpload,
  };

  return {
    user,
    uploads,
    readiness,
    requirements,
  };
};
