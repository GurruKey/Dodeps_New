export default function getTimestamp(value) {
  if (!value) {
    return Number.NaN;
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return Number.NaN;
  }

  return timestamp;
}
