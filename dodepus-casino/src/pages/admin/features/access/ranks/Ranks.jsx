import { Stack } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import AssignRank from './blocks/AssignRank/AssignRank.jsx';
import EditRankBenefits from './blocks/EditRank/EditRankBenefits.jsx';
import RankMatrix from './blocks/RankMatrix.jsx';

export default function Ranks() {
  const { isLoading } = useOutletContext() ?? {};

  return (
    <Stack gap={3}>
      <AssignRank statusMessage={isLoading ? 'Синхронизация с данными выполняется…' : ''} />
      <EditRankBenefits />
      <RankMatrix />
    </Stack>
  );
}
