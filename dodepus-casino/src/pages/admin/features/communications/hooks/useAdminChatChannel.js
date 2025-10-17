import { useMemo } from 'react';
import { listCommunicationThreads } from '../../../../../../local-sim/modules/communications/index.js';

export function useAdminChatChannel(channel) {
  const threads = useMemo(() => {
    if (!channel) return [];
    return listCommunicationThreads(channel) ?? [];
  }, [channel]);

  const activeThread = threads.length > 0 ? threads[0] : null;

  return {
    channel,
    threads,
    activeThread,
  };
}
