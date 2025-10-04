import { useMemo } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

const RANGE_OPTIONS = [
  { value: 'hour', label: 'Час' },
  { value: 'day', label: 'День' },
  { value: 'month', label: 'Месяц' },
];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const toDateOrNull = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatHourLabel = (date) =>
  date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDayLabel = (date) =>
  date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });

const formatMonthLabel = (date) =>
  date.toLocaleDateString('ru-RU', {
    year: '2-digit',
    month: '2-digit',
  });

const groupByHour = (activations) => {
  const now = Date.now();
  const buckets = [];

  for (let step = 23; step >= 0; step -= 1) {
    const bucketEnd = now - step * HOUR_MS;
    const bucketStart = bucketEnd - HOUR_MS;
    const startDate = new Date(bucketStart);
    const endDate = new Date(bucketEnd);
    const value = activations.filter(
      (time) => time >= bucketStart && time < bucketEnd,
    ).length;

    buckets.push({
      label: formatHourLabel(endDate),
      value,
    });
  }

  return buckets;
};

const groupByDay = (activations) => {
  const now = Date.now();
  const buckets = [];

  for (let step = 29; step >= 0; step -= 1) {
    const bucketEnd = now - step * DAY_MS;
    const bucketStart = bucketEnd - DAY_MS;
    const startDate = new Date(bucketStart);
    const value = activations.filter(
      (time) => time >= bucketStart && time < bucketEnd,
    ).length;

    buckets.push({
      label: formatDayLabel(startDate),
      value,
    });
  }

  return buckets;
};

const groupByMonth = (activations) => {
  const now = new Date();
  const buckets = [];

  for (let step = 11; step >= 0; step -= 1) {
    const bucketStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - step, 1));
    const bucketEnd = new Date(Date.UTC(bucketStart.getUTCFullYear(), bucketStart.getUTCMonth() + 1, 1));
    const startTime = bucketStart.getTime();
    const endTime = bucketEnd.getTime();

    const value = activations.filter((time) => time >= startTime && time < endTime).length;

    buckets.push({
      label: formatMonthLabel(bucketStart),
      value,
    });
  }

  return buckets;
};

const groupActivations = (activations, range) => {
  const timestamps = Array.isArray(activations)
    ? activations
        .map((item) => {
          if (typeof item === 'number') return item;
          const parsed = toDateOrNull(item?.activatedAt ?? item);
          return parsed ? parsed.getTime() : null;
        })
        .filter((time) => typeof time === 'number')
    : [];

  switch (range) {
    case 'hour':
      return groupByHour(timestamps);
    case 'month':
      return groupByMonth(timestamps);
    case 'day':
    default:
      return groupByDay(timestamps);
  }
};

export default function ActivationChart({ activations, range, onRangeChange }) {
  const buckets = useMemo(() => groupActivations(activations, range), [activations, range]);
  const maxValue = useMemo(
    () => buckets.reduce((acc, bucket) => Math.max(acc, bucket.value), 0),
    [buckets],
  );

  return (
    <div className="activation-chart">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0">График активаций</h5>
        <ButtonGroup>
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={option.value === range ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => onRangeChange?.(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="activation-chart__grid">
        {buckets.map((bucket) => {
          const height = maxValue > 0 ? Math.round((bucket.value / maxValue) * 100) : 0;
          return (
            <div key={bucket.label} className="activation-chart__column" role="presentation">
              <div className="activation-chart__bar-track">
                <div className="activation-chart__bar-fill" style={{ height: `${height}%` }} />
              </div>
              <div className="activation-chart__bar-value">{bucket.value}</div>
              <div className="activation-chart__bar-label">{bucket.label}</div>
            </div>
          );
        })}
        {buckets.length === 0 && (
          <div className="w-100 text-center text-muted py-5">Нет активаций в выбранном периоде</div>
        )}
      </div>
    </div>
  );
}
