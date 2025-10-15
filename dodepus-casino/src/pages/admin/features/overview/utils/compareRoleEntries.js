export default function compareRoleEntries(entryA, entryB) {
  const levelA = Number.isFinite(entryA.level) ? entryA.level : Number.NEGATIVE_INFINITY;
  const levelB = Number.isFinite(entryB.level) ? entryB.level : Number.NEGATIVE_INFINITY;

  if (levelB !== levelA) {
    return levelB - levelA;
  }

  return String(entryA.id).localeCompare(String(entryB.id));
}
