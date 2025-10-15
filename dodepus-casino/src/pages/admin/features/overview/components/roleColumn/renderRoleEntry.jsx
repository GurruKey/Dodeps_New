export default function renderRoleEntry(entry) {
  return (
    <div
      key={entry.id}
      className="border rounded px-2 py-2 d-flex justify-content-between align-items-center"
    >
      <span className="text-truncate me-2" style={{ maxWidth: '70%' }}>
        {entry.id}
      </span>
      <span className="fw-semibold">{entry.level ?? '—'}</span>
    </div>
  );
}
