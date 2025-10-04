const eventCode = {
  id: 'event-code',
  name: 'Турнир/Ивент-код',
  shortName: 'Event',
  description: 'Открывает участие в турнире, выдаёт билеты или дополнительные очки прогресса.',
  howItWorks: 'Открывает участие/билеты/очки.',
  formula: 'Нет универсальной формулы; часто «+N очков» или «доступ к сетке».',
  plainText: 'Код — пропуск в турнир или ускоряет прогресс.',
  seed: {
    code: 'TOURNEYKEY',
    title: 'Ключ в турнир «Блиц»',
    reward: 'Доступ +500 очков старта',
    limit: 1500,
    used: 890,
    status: 'active',
    wager: null,
    cashoutCap: null,
    params: {
      bonusPoints: 500,
      eventId: 'blitz-cup',
    },
    notes: 'Активирует доступ к сетке с призовым фондом 5 000$.',
  },
};

export default eventCode;
