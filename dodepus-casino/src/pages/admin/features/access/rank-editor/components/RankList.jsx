import { Card, Stack } from 'react-bootstrap';
import RankListItem from './RankListItem.jsx';

export default function RankList({ ranks, currentLevelMap, savingLevel, onSave }) {
  if (!Array.isArray(ranks) || ranks.length === 0) {
    return (
      <Card className="border-0 surface-card">
        <Card.Body className="py-4 text-center text-muted">Пока нет ни одного VIP ранга для редактирования.</Card.Body>
      </Card>
    );
  }

  return (
    <Stack gap={3}>
      {ranks.map((rank) => (
        <RankListItem
          key={rank.level}
          rank={rank}
          levelMeta={currentLevelMap?.[rank.level]}
          onSave={onSave}
          isSaving={savingLevel === rank.level}
        />
      ))}
    </Stack>
  );
}
