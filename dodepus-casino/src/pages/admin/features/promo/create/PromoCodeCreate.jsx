import { Alert, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap';
import { promoTypeDefinitions } from '../../../../../../local-sim/modules/promo/definitions/index.js';
import PromoTypesReference from './blocks/PromoTypesReference.jsx';
import { usePromoConstructor } from './hooks/usePromoConstructor.js';
import BasicSettingsSection from './sections/BasicSettingsSection.jsx';
import RewardSection from './sections/RewardSection.jsx';
import LimitsScheduleSection from './sections/LimitsScheduleSection.jsx';
import RepeatSection from './sections/RepeatSection.jsx';
import AudienceSection from './sections/AudienceSection.jsx';
import AdvancedLimitsSection from './sections/AdvancedLimitsSection.jsx';
import DisplaySection from './sections/DisplaySection.jsx';
import NotesSection from './sections/NotesSection.jsx';
import SummaryCard from './sections/SummaryCard.jsx';

export default function PromoCodeCreate() {
  const {
    STATUS_OPTIONS: statusOptions,
    BALANCE_OPTIONS: balanceOptions,
    formValues,
    rewardForm,
    audienceForm,
    limitsForm,
    displayForm,
    rewardPreview,
    summaryGroups,
    selectedType,
    error,
    success,
    isSubmitting,
    handleTypeSelect,
    handleFieldChange,
    handleRewardFormChange,
    handleRewardToggle,
    handleAudienceFieldChange,
    handleAudienceToggle,
    handleLimitsFieldChange,
    handleDisplayFieldChange,
    handleDisplayToggle,
    handleResetRewardToPreview,
    handleSubmit,
    resetForms,
    setError,
    setSuccess,
  } = usePromoConstructor();

  return (
    <Stack gap={3} as="section" aria-label="Создание Promo">
      <Card>
        <Card.Body>
          <Card.Title as="h3" className="mb-2">
            Создать Promo
          </Card.Title>
          <Card.Text className="text-muted mb-0">
            Выберите тип, настройте награды, аудиторию и оформление, затем сохраните результат в local-sim.
          </Card.Text>
        </Card.Body>
      </Card>

      <Row className="g-3 align-items-start">
        <Col xl={8} lg={7}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                <Stack gap={4}>
                  <BasicSettingsSection
                    formValues={formValues}
                    statusOptions={statusOptions}
                    promoTypes={promoTypeDefinitions}
                    selectedType={selectedType}
                    onTypeSelect={handleTypeSelect}
                    onFieldChange={handleFieldChange}
                  />

                  <RewardSection
                    rewardForm={rewardForm}
                    rewardPreview={rewardPreview}
                    formValues={formValues}
                    balanceOptions={balanceOptions}
                    onRewardChange={handleRewardFormChange}
                    onRewardToggle={handleRewardToggle}
                    onFieldChange={handleFieldChange}
                    onResetRewardToPreview={handleResetRewardToPreview}
                  />

                  <LimitsScheduleSection formValues={formValues} onFieldChange={handleFieldChange} />

                  <RepeatSection formValues={formValues} onFieldChange={handleFieldChange} />

                  <AudienceSection
                    audienceForm={audienceForm}
                    onFieldChange={handleAudienceFieldChange}
                    onToggle={handleAudienceToggle}
                  />

                  <AdvancedLimitsSection limitsForm={limitsForm} onFieldChange={handleLimitsFieldChange} />

                  <DisplaySection
                    displayForm={displayForm}
                    onFieldChange={handleDisplayFieldChange}
                    onToggle={handleDisplayToggle}
                  />

                  <NotesSection value={formValues.notes} onChange={handleFieldChange} />

                  {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                      {error.message}
                    </Alert>
                  )}
                  {success && (
                    <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                      {success}
                    </Alert>
                  )}

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="outline-secondary" type="reset" onClick={resetForms}>
                      Очистить
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Сохраняем…' : 'Сохранить в local-sim'}
                    </Button>
                  </div>
                </Stack>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} lg={5}>
          <Stack gap={3}>
            <PromoTypesReference selectedTypeId={formValues.typeId} />
            <SummaryCard groups={summaryGroups} statusOptions={statusOptions} />
          </Stack>
        </Col>
      </Row>
    </Stack>
  );
}
