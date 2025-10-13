import { Card, Table } from 'react-bootstrap';
import { rankBenefitMatrix, rankMatrixLegend } from '../data/rankConfigs.js';

export default function RankMatrix() {
  const benefitKeys = Object.keys(rankMatrixLegend);

  return (
    <Card>
      <Card.Body>
        <Card.Title>Матрица рангов</Card.Title>
        <Card.Text className="text-muted">
          Просмотр доступных привилегий для каждого пользовательского ранга.
        </Card.Text>
        <Table responsive hover className="mb-0 align-middle text-center">
          <thead>
            <tr>
              <th className="text-start" style={{ minWidth: 200 }}>Ранг</th>
              {benefitKeys.map((benefitKey) => (
                <th key={benefitKey}>{rankMatrixLegend[benefitKey]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankBenefitMatrix.map((rank) => (
              <tr key={rank.rankId}>
                <td className="text-start fw-medium">{rank.rankName}</td>
                {benefitKeys.map((benefitKey) => (
                  <td key={benefitKey}>
                    {rank.benefits[benefitKey] ? '✅' : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
