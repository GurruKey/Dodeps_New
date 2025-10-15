export default function normalizeClients(clients) {
  if (Array.isArray(clients)) {
    return clients;
  }

  return [];
}
