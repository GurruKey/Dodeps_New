import { Badge } from 'react-bootstrap';
import RankBadge from '../../../../../shared/rank/components/RankBadge.jsx';

export const createNavItems = ({ balanceLabel, verificationMeta, rankMeta }) => [
  {
    key: 'wallet',
    to: 'wallet',
    label: 'Баланс',
    right: () => <Badge bg="secondary">{balanceLabel}</Badge>,
  },
  { key: 'history', to: 'history', label: 'История транзакций' },
  { key: 'terminal', to: 'terminal', label: 'Терминал' },
  { key: 'divider-1', type: 'divider' },
  { key: 'personal', to: 'personal', label: 'Персональные данные', end: true },
  {
    key: 'verification',
    to: 'verification',
    label: 'Верификация',
    labelClass: verificationMeta.labelClass,
    right: () => (
      <Badge bg={verificationMeta.variant}>
        {verificationMeta.approved} / {verificationMeta.total}
      </Badge>
    ),
  },
  { key: 'divider-2', type: 'divider' },
  {
    key: 'rank',
    to: 'rank',
    label: 'Ранг',
    right: () => (
      <RankBadge preview={rankMeta.preview} className="px-3 py-1">
        {rankMeta.label}
      </RankBadge>
    ),
  },
  { key: 'promos', to: 'promos', label: 'Акции для игры' },
  { key: 'season', to: 'season', label: 'Сезон' },
  { key: 'divider-3', type: 'divider' },
  { key: 'games-history', to: 'games-history', label: 'История игр' },
];

export default createNavItems;
