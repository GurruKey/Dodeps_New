import { Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import PromoCodesHeader from './blocks/PromoCodesHeader.jsx';
import PromoCodesTable from './blocks/PromoCodesTable.jsx';

const demoPromocodes = [
  {
    code: 'WELCOME100',
    title: 'Приветственный бонус',
    reward: '100 фриспинов',
    limit: 1000,
    used: 742,
    status: 'active',
    statusLabel: 'Активен',
  },
  {
    code: 'VIPBOOST',
    title: 'VIP Boost',
    reward: '+50% к депозиту',
    limit: 200,
    used: 58,
    status: 'scheduled',
    statusLabel: 'Запланирован',
  },
  {
    code: 'SPRING2024',
    title: 'Весенний сезон',
    reward: 'Кэшбек 15%',
    limit: null,
    used: 320,
    status: 'expired',
    statusLabel: 'Истёк',
  },
];

export default function PromoCodes() {
  const { isLoading, onReload } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <PromoCodesHeader isLoading={isLoading} onReload={onReload} />
      <PromoCodesTable promocodes={demoPromocodes} />
    </Stack>
  );
}
