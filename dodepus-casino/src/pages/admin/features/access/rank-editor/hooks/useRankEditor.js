import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listAdminRankRewards,
  updateAdminRankReward,
  resetAdminRankRewards,
} from '@local-sim/modules/access/index.js';

const toError = (error, fallbackMessage) => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
};

export const useRankEditor = () => {
  const [ranks, setRanks] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [savingLevel, setSavingLevel] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listAdminRankRewards();
      setRanks(Array.isArray(data?.rewards) ? data.rewards : []);
      setLevels(Array.isArray(data?.levels) ? data.levels : []);
    } catch (err) {
      setError(toError(err, 'Не удалось загрузить данные рангов.'));
      setRanks([]);
      setLevels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateRank = useCallback(async (level, changes) => {
    setSavingLevel(level);
    setError(null);

    try {
      const { record, records } = await updateAdminRankReward({ level, ...changes });
      if (Array.isArray(records)) {
        setRanks(records);
      }
      return record;
    } catch (err) {
      const normalized = toError(err, 'Не удалось обновить ранг.');
      setError(normalized);
      throw normalized;
    } finally {
      setSavingLevel(null);
    }
  }, []);

  const resetRanks = useCallback(async () => {
    setIsResetting(true);
    setError(null);

    try {
      const records = await resetAdminRankRewards();
      if (Array.isArray(records)) {
        setRanks(records);
      }
    } catch (err) {
      const normalized = toError(err, 'Не удалось сбросить ранги.');
      setError(normalized);
      throw normalized;
    } finally {
      setIsResetting(false);
    }
  }, []);

  const currentLevelMap = useMemo(() => {
    return levels.reduce((acc, level) => {
      acc[level.level] = level;
      return acc;
    }, {});
  }, [levels]);

  const clearError = useCallback(() => setError(null), []);

  return {
    ranks,
    levels,
    currentLevelMap,
    isLoading,
    isResetting,
    savingLevel,
    error,
    load,
    updateRank,
    resetRanks,
    clearError,
  };
};
