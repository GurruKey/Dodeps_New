export const availableRoles = [
  {
    id: 'moderator',
    name: 'Модератор',
    description: 'Следит за чатом и клиентскими обращениями.',
  },
  {
    id: 'admin',
    name: 'Администратор',
    description: 'Полный доступ к панели и настройкам.',
  },
  {
    id: 'analyst',
    name: 'Аналитик',
    description: 'Просмотр статистики и отчётов без права изменений.',
  },
  {
    id: 'intern',
    name: 'Стажёр',
    description: 'Ограниченный доступ под присмотром.',
  },
];

export const rolePermissionMatrix = [
  {
    roleId: 'admin',
    roleName: 'Администратор',
    permissions: {
      overview: true,
      clients: true,
      promocodes: true,
      roles: true,
      transactions: true,
      verification: true,
      chat: true,
    },
  },
  {
    roleId: 'moderator',
    roleName: 'Модератор',
    permissions: {
      overview: true,
      clients: true,
      promocodes: false,
      roles: false,
      transactions: false,
      verification: true,
      chat: true,
    },
  },
  {
    roleId: 'analyst',
    roleName: 'Аналитик',
    permissions: {
      overview: true,
      clients: false,
      promocodes: true,
      roles: false,
      transactions: true,
      verification: false,
      chat: false,
    },
  },
  {
    roleId: 'intern',
    roleName: 'Стажёр',
    permissions: {
      overview: true,
      clients: false,
      promocodes: false,
      roles: false,
      transactions: false,
      verification: false,
      chat: false,
    },
  },
];

export const roleMatrixLegend = {
  overview: 'Обзор',
  clients: 'Клиенты',
  promocodes: 'Промокоды',
  roles: 'Выдать роль',
  transactions: 'Транзакции',
  verification: 'Верификация',
  chat: 'Чат модераторов',
};

export const transactionHistory = [
  {
    id: 'TXN-82039',
    user: 'ID-10192',
    amount: '+ 2 500 ₽',
    method: 'Банковская карта',
    status: 'completed',
    createdAt: '12.03.2024 15:18',
  },
  {
    id: 'TXN-82012',
    user: 'ID-10177',
    amount: '- 1 200 ₽',
    method: 'Вывод на карту',
    status: 'pending',
    createdAt: '12.03.2024 14:02',
  },
  {
    id: 'TXN-81987',
    user: 'ID-10192',
    amount: '+ 700 ₽',
    method: 'Криптокошелёк',
    status: 'failed',
    createdAt: '11.03.2024 22:46',
  },
];

export const verificationQueue = [
  {
    id: 'VRF-3007',
    userId: 'ID-10991',
    documentType: 'Паспорт',
    submittedAt: '12.03.2024 11:25',
    status: 'waiting',
  },
  {
    id: 'VRF-3006',
    userId: 'ID-10054',
    documentType: 'Водительское удостоверение',
    submittedAt: '12.03.2024 10:11',
    status: 'inReview',
  },
  {
    id: 'VRF-3005',
    userId: 'ID-10321',
    documentType: 'Загранпаспорт',
    submittedAt: '11.03.2024 21:39',
    status: 'approved',
  },
];

export const chatThreads = [
  {
    id: 'thread-main',
    title: 'Общий чат модерации',
    participants: ['Алина', 'Константин', 'Влад'],
    messages: [
      {
        id: 'msg-1',
        author: 'Алина',
        text: 'Проверила жалобу 403, выдала предупреждение.',
        createdAt: '12.03.2024 15:20',
      },
      {
        id: 'msg-2',
        author: 'Константин',
        text: 'Есть спорный кейс по ID-10111, гляньте историю.',
        createdAt: '12.03.2024 15:11',
      },
      {
        id: 'msg-3',
        author: 'Влад',
        text: 'Заберу проверку!',
        createdAt: '12.03.2024 15:05',
      },
    ],
  },
];
