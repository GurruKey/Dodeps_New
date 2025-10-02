const CLIENT_FIXTURES = [
  {
    id: 'CL-001',
    email: 'anna.ivanova@example.com',
    phone: '+7 (999) 123-45-67',
    totalBalance: 12500,
    status: 'active',
    role: { group: 'user' },
  },
  {
    id: 'CL-002',
    email: 'pavel.petrov@example.com',
    phone: '+7 (916) 555-10-20',
    totalBalance: 0,
    status: 'ban',
    role: { group: 'intern', level: 1 },
  },
  {
    id: 'CL-003',
    email: 'daria.smirnova@example.com',
    phone: '+44 7700 900123',
    totalBalance: 3870,
    status: 'active',
    role: { group: 'intern', level: 3 },
  },
  {
    id: 'CL-004',
    email: 'mark.taylor@example.com',
    phone: '+1 (202) 555-0134',
    totalBalance: 842,
    status: 'active',
    role: { group: 'moderator', level: 2 },
  },
  {
    id: 'CL-005',
    email: 'li.wang@example.com',
    phone: '+86 10 5555 1234',
    totalBalance: 15420,
    status: 'active',
    role: { group: 'admin', level: 4 },
  },
  {
    id: 'CL-006',
    email: 'maria.garcia@example.com',
    phone: '+34 600 123 456',
    totalBalance: 57,
    status: 'ban',
    role: { group: 'moderator', level: 1 },
  },
  {
    id: 'CL-007',
    email: 'samir.khan@example.com',
    phone: '+971 50 123 4567',
    totalBalance: 230,
    status: 'active',
    role: { group: 'admin', level: 2 },
  },
  {
    id: 'CL-008',
    email: 'elena.kozlova@example.com',
    phone: '+7 (495) 777-99-00',
    totalBalance: 5230,
    status: 'active',
    role: { group: 'owner' },
  },
];

const cloneClient = (client) => JSON.parse(JSON.stringify(client));

const createAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  if (typeof DOMException === 'function') {
    return new DOMException('Aborted', 'AbortError');
  }
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
};

export const adminClients = Object.freeze(CLIENT_FIXTURES.map(cloneClient));

export function listClients({ signal, delay = 200 } = {}) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError(signal.reason));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(adminClients.map(cloneClient));
    }, Math.max(0, delay));

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(createAbortError(signal.reason));
        },
        { once: true }
      );
    }
  });
}
