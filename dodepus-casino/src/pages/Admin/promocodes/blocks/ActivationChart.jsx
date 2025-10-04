import { useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

const RANGE_OPTIONS = [
  { value: 'hour', label: 'Час' },
  { value: 'day', label: 'День' },
  { value: 'month', label: 'Месяц' },
];

const DEFAULT_RANGE = 'day';
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

const createView = (range, start = null, end = null, label = null) => ({
  range,
  start,
  end,
  label,
});

const groupByHour = (timestamps, view) => {
  const buckets = [];

  if (typeof view.start === 'number' && typeof view.end === 'number') {
    const startDate = new Date(view.start);
    startDate.setMinutes(0, 0, 0);

    for (let index = 0; index < 24 && startDate.getTime() < view.end; index += 1) {
      const bucketStart = startDate.getTime();
      const nextDate = new Date(startDate);
      nextDate.setHours(nextDate.getHours() + 1);
      const bucketEnd = Math.min(nextDate.getTime(), view.end);

      const value = timestamps.filter((time) => time >= bucketStart && time < bucketEnd).length;

      buckets.push({
        label: formatHourLabel(new Date(bucketStart)),
        value,
        start: bucketStart,
        end: bucketEnd,
      });

      startDate.setHours(startDate.getHours() + 1);
    }

    return buckets;
  }

  const now = new Date();
  now.setMinutes(0, 0, 0);
  const endOfCurrentHour = new Date(now);
  endOfCurrentHour.setHours(endOfCurrentHour.getHours() + 1);

  for (let step = 23; step >= 0; step -= 1) {
    const bucketEnd = endOfCurrentHour.getTime() - step * HOUR_MS;
    const bucketStart = bucketEnd - HOUR_MS;
    const startDate = new Date(bucketStart);

    const value = timestamps.filter((time) => time >= bucketStart && time < bucketEnd).length;

    buckets.push({
      label: formatHourLabel(startDate),
      value,
      start: bucketStart,
      end: bucketEnd,
    });
  }

  return buckets;
};

const groupByDay = (timestamps, view) => {
  const buckets = [];

  if (typeof view.start === 'number' && typeof view.end === 'number') {
    const cursor = new Date(view.start);
    cursor.setHours(0, 0, 0, 0);

    while (cursor.getTime() < view.end) {
      const bucketStart = cursor.getTime();
      const nextDate = new Date(cursor);
      nextDate.setDate(nextDate.getDate() + 1);
      const bucketEnd = Math.min(nextDate.getTime(), view.end);

      const value = timestamps.filter((time) => time >= bucketStart && time < bucketEnd).length;

      buckets.push({
        label: formatDayLabel(new Date(bucketStart)),
        value,
        start: bucketStart,
        end: bucketEnd,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return buckets;
  }

  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  endDate.setDate(endDate.getDate() + 1);

  for (let step = 29; step >= 0; step -= 1) {
    const bucketEnd = endDate.getTime() - step * DAY_MS;
    const bucketStart = bucketEnd - DAY_MS;
    const startDate = new Date(bucketStart);

    const value = timestamps.filter((time) => time >= bucketStart && time < bucketEnd).length;

    buckets.push({
      label: formatDayLabel(startDate),
      value,
      start: bucketStart,
      end: bucketEnd,
    });
  }

  return buckets;
};

const groupByMonth = (timestamps) => {
  const buckets = [];
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  endDate.setMonth(endDate.getMonth() + 1, 1);

  for (let step = 11; step >= 0; step -= 1) {
    const bucketStartDate = new Date(endDate);
    bucketStartDate.setMonth(bucketStartDate.getMonth() - (step + 1), 1);
    const bucketEndDate = new Date(bucketStartDate);
    bucketEndDate.setMonth(bucketEndDate.getMonth() + 1, 1);

    const bucketStart = bucketStartDate.getTime();
    const bucketEnd = bucketEndDate.getTime();

    const value = timestamps.filter((time) => time >= bucketStart && time < bucketEnd).length;

    buckets.push({
      label: formatMonthLabel(bucketStartDate),
      value,
      start: bucketStart,
      end: bucketEnd,
    });
  }

  return buckets;
};

const groupActivations = (activations, view) => {
  const timestamps = Array.isArray(activations)
    ? activations
        .map((item) => {
          if (typeof item === 'number') return item;
          const parsed = toDateOrNull(item?.activatedAt ?? item);
          return parsed ? parsed.getTime() : null;
        })
        .filter((time) => typeof time === 'number')
    : [];

  const relevantTimestamps = typeof view.start === 'number' && typeof view.end === 'number'
    ? timestamps.filter((time) => time >= view.start && time < view.end)
    : timestamps;

  switch (view.range) {
    case 'hour':
      return groupByHour(relevantTimestamps, view);
    case 'month':
      return groupByMonth(relevantTimestamps);
    case 'day':
    default:
      return groupByDay(relevantTimestamps, view);
  }
};

const buildDrillPath = (viewStack) =>
  viewStack
    .slice(1)
    .map((view) => view.label)
    .filter(Boolean)
    .join(' / ');

export default function ActivationChart({ activations, initialRange = DEFAULT_RANGE }) {
  const [viewStack, setViewStack] = useState([createView(initialRange)]);

  useEffect(() => {
    setViewStack([createView(initialRange)]);
  }, [initialRange]);

  const currentView = viewStack[viewStack.length - 1] ?? createView(DEFAULT_RANGE);

  const buckets = useMemo(
    () => groupActivations(activations, currentView),
    [activations, currentView],
  );

  const maxValue = useMemo(
    () => buckets.reduce((acc, bucket) => Math.max(acc, bucket.value), 0),
    [buckets],
  );

  const isDense = buckets.length > 18;
  const drillPath = buildDrillPath(viewStack);

  const handleRangeChange = (range) => {
    setViewStack([createView(range)]);
  };

  const handleColumnClick = (bucket) => {
    if (currentView.range === 'month') {
      setViewStack((prev) => [
        ...prev,
        createView('day', bucket.start, bucket.end, bucket.label),
      ]);
    } else if (currentView.range === 'day') {
      setViewStack((prev) => [
        ...prev,
        createView('hour', bucket.start, bucket.end, bucket.label),
      ]);
    }
  };

  const handleBack = () => {
    setViewStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const currentRange = currentView.range;

  return (
    <div className={`activation-chart${isDense ? ' activation-chart--dense' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0">График активаций</h5>
        <ButtonGroup>
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={option.value === currentRange ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => handleRangeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {viewStack.length > 1 && (
        <div className="activation-chart__breadcrumbs d-flex align-items-center gap-2 mb-2 flex-wrap">
          <Button variant="link" size="sm" className="p-0" onClick={handleBack}>
            Назад
          </Button>
          {drillPath && <span className="text-muted small">{drillPath}</span>}
        </div>
      )}

      <div className="activation-chart__grid">
        {buckets.map((bucket) => {
          const height = maxValue > 0 ? Math.round((bucket.value / maxValue) * 100) : 0;
          const isInteractive = currentRange !== 'hour' && bucket.start != null && bucket.end != null;
          const columnClassName = `activation-chart__column${
            isInteractive ? ' activation-chart__column--interactive' : ''
          }`;

          return (
            <div
              key={`${bucket.label}-${bucket.start ?? ''}`}
              className={columnClassName}
              role={isInteractive ? 'button' : 'presentation'}
              tabIndex={isInteractive ? 0 : undefined}
              onClick={isInteractive ? () => handleColumnClick(bucket) : undefined}
              onKeyDown={
                isInteractive
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleColumnClick(bucket);
                      }
                    }
                  : undefined
              }
              title={isInteractive ? 'Нажмите, чтобы детализировать период' : undefined}
            >
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
