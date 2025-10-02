import { Table } from 'react-bootstrap';

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ClientsTable({ clients }) {
  if (!clients.length) {
    return <div className="text-muted">По заданным критериям клиенты не найдены.</div>;
  }

  return (
    <Table responsive hover className="mb-0">
      <thead>
        <tr>
          <th style={{ width: '10%' }}>ID</th>
          <th style={{ width: '35%' }}>E-mail</th>
          <th style={{ width: '25%' }}>Телефон</th>
          <th style={{ width: '15%' }} className="text-end">Общий баланс</th>
          <th style={{ width: '15%' }}>Статус</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>{client.id}</td>
            <td>{client.email}</td>
            <td>{client.phone}</td>
            <td className="text-end">{formatCurrency(client.totalBalance)}</td>
            <td>{client.status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
