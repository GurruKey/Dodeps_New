export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Черновик' },
  { value: 'active', label: 'Активен' },
  { value: 'scheduled', label: 'Запланирован' },
];

export const BALANCE_OPTIONS = [
  { value: 'main', label: 'Основной баланс' },
  { value: 'casino', label: 'Баланс казино' },
];

export const DEFAULT_HIGHLIGHT_COLOR = '#146C94';

export const balanceLabelMap = {
  main: 'основной баланс',
  casino: 'баланс казино',
};

export const emptyRewardForm = {
  depositEnabled: false,
  depositPercent: '',
  depositMaxAmount: '',
  cashEnabled: false,
  cashAmount: '',
  freeSpinsEnabled: false,
  freeSpins: '',
  freeSpinsValue: '',
  freeSpinsGame: '',
  customTextEnabled: false,
  customText: '',
  currency: '$',
  balanceType: 'main',
};

export const emptyAudienceForm = {
  segments: '',
  countries: '',
  levels: '',
  tags: '',
  vipOnly: false,
  newPlayersOnly: false,
};

export const emptyLimitsForm = {
  minDeposit: '',
  maxDeposit: '',
  minBalance: '',
  maxBalance: '',
  maxUsagePerClient: '',
  allowedCurrencies: '',
  currency: '$',
};

export const emptyDisplayForm = {
  showOnMain: false,
  showInStore: true,
  highlight: false,
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  badgeText: '',
  description: '',
  channels: '',
};

export const emptyForm = {
  typeId: '',
  code: '',
  title: '',
  reward: '',
  limit: '',
  status: 'draft',
  wager: '',
  cashoutCap: '',
  notes: '',
  startsAt: '',
  endsAt: '',
  repeatLimit: '',
  repeatDelayHours: '',
};
