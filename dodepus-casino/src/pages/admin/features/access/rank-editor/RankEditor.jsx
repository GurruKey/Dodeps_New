import { Alert, Spinner, Stack } from 'react-bootstrap';
import { RankEditorIntro, RankList } from './components/index.js';
import { useRankEditor } from './hooks/index.js';

export default function RankEditor() {
  const {
    ranks,
    currentLevelMap,
    isLoading,
    isResetting,
    savingLevel,
    error,
    load,
    updateRank,
    resetRanks,
    clearError,
  } = useRankEditor();

  return (
    <Stack gap={3}>
      <RankEditorIntro onReset={resetRanks} onReload={load} isResetting={isResetting} isLoading={isLoading} />

      {error && (
        <Alert variant="danger" onClose={clearError} dismissible>
          {error.message}
        </Alert>
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <RankList ranks={ranks} currentLevelMap={currentLevelMap} savingLevel={savingLevel} onSave={updateRank} />
      )}
    </Stack>
  );
}
