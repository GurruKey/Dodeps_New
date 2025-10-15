import { useMemo } from 'react';
import normalizeClients from '../utils/normalizeClients.js';
import getTimestamp from '../utils/getTimestamp.js';
import isTimestampWithinLastWeek from '../utils/isTimestampWithinLastWeek.js';

export default function useNewClients(clients) {
  const normalizedClients = normalizeClients(clients);

  return useMemo(() => {
    if (!normalizedClients.length) {
      return 0;
    }

    const now = Date.now();

    return normalizedClients.reduce((count, client) => {
      const timestamp = getTimestamp(client?.createdAt);

      if (isTimestampWithinLastWeek(timestamp, now)) {
        return count + 1;
      }

      return count;
    }, 0);
  }, [normalizedClients]);
}
