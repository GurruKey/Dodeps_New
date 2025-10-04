const noDepositMoney = {
  id: 'no-deposit-money',
  name: 'Бездепозитный (деньги)',
  shortName: 'No-Dep Cash',
  description: 'Выдаёт фиксированную сумму за код или регистрацию без необходимости пополнять счёт.',
  howItWorks: 'Деньги за код/регистрацию без депозита.',
  formula: '**Бонус:** фикс (B). **Вейджер:** (w · B). **Кеп:** (= k · B) или (C_max).',
  plainText:
    'Дали денег «на попробовать», но вывод возможен только после отыгрыша и часто с лимитом.',
  seed: {
    code: 'TRYFREE20',
    title: '20$ без депозита',
    reward: '20 USD на баланс',
    limit: 100,
    used: 94,
    status: 'active',
    wager: 45,
    cashoutCap: 3,
    params: {
      fixedAmount: 20,
    },
    notes: 'Требует подтверждение телефона перед выводом.',
  },
};

export default noDepositMoney;
