import { useMemo } from 'react';
import normalizeClients from '../utils/normalizeClients.js';

export default function useTotalClients(clients) {
  const normalizedClients = normalizeClients(clients);

  return useMemo(() => normalizedClients.length, [normalizedClients]);
}
