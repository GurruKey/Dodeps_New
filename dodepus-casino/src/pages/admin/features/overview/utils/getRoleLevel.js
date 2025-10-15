export default function getRoleLevel(role) {
  const level = Number(role?.level);

  if (!Number.isFinite(level)) {
    return null;
  }

  return level;
}
