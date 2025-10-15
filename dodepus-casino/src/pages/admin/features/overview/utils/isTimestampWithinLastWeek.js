const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export default function isTimestampWithinLastWeek(timestamp, referenceTimestamp) {
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const upperBound = Number.isFinite(referenceTimestamp) ? referenceTimestamp : Date.now();
  const lowerBound = upperBound - WEEK_IN_MS;

  return timestamp >= lowerBound && timestamp <= upperBound;
}
