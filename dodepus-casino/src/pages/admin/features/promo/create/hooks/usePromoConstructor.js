import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdminPromocode,
  promoTypeDefinitions,
} from '../../../../../../../local-sim/modules/promo/index.js';
import {
  BALANCE_OPTIONS,
  DEFAULT_HIGHLIGHT_COLOR,
  STATUS_OPTIONS,
  emptyAudienceForm,
  emptyDisplayForm,
  emptyForm,
  emptyLimitsForm,
  emptyRewardForm,
} from '../constants.js';
import {
  formatDateInputValue,
  formatListForInput,
  formatNumberInput,
  toIsoOrNull,
} from '../utils/format.js';
import { buildRewardPreview, normalizeRewardParams } from '../utils/reward.js';
import { buildAudiencePreview, composeAudienceParams } from '../utils/audience.js';
import { buildLimitsPreview, composeLimitsParams } from '../utils/limits.js';
import { buildDisplayPreview, composeDisplayParams } from '../utils/display.js';

const ensurePromoType = (typeId) => promoTypeDefinitions.find((type) => type.id === typeId) ?? null;

export const usePromoConstructor = () => {
  const [formValues, setFormValues] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [rewardTouched, setRewardTouched] = useState(false);
  const [audienceForm, setAudienceForm] = useState(emptyAudienceForm);
  const [limitsForm, setLimitsForm] = useState(emptyLimitsForm);
  const [displayForm, setDisplayForm] = useState(emptyDisplayForm);

  const selectedType = useMemo(() => ensurePromoType(formValues.typeId), [formValues.typeId]);

  const rewardPreview = useMemo(() => buildRewardPreview(rewardForm), [rewardForm]);
  const audiencePreview = useMemo(() => buildAudiencePreview(audienceForm), [audienceForm]);
  const limitsPreview = useMemo(() => buildLimitsPreview(limitsForm, rewardForm), [limitsForm, rewardForm]);
  const displayPreview = useMemo(() => buildDisplayPreview(displayForm), [displayForm]);

  useEffect(() => {
    setFormValues((prev) => {
      if (rewardTouched || prev.reward === rewardPreview) {
        return prev;
      }

      return {
        ...prev,
        reward: rewardPreview,
      };
    });
  }, [rewardPreview, rewardTouched]);

  const handleTypeSelect = useCallback((typeId) => {
    const targetType = ensurePromoType(typeId);
    if (!targetType) return;

    const seedSchedule = targetType?.seed?.schedule ?? targetType?.seed?.params?.schedule ?? {};
    const repeatSeed = targetType?.seed?.params?.repeat ?? targetType?.seed?.repeat ?? {};
    const paramsSeed = targetType?.seed?.params ?? {};
    const rewardSeed = paramsSeed.reward ?? {};
    const audienceSeed = paramsSeed.audience ?? {};
    const limitsSeed = paramsSeed.limits ?? {};
    const displaySeed = paramsSeed.display ?? {};

    setFormValues((prev) => {
      if (prev.typeId === typeId) {
        return prev;
      }

      return {
        ...prev,
        typeId,
        title: prev.title || targetType.name || '',
        reward: prev.reward || targetType?.seed?.reward || '',
        limit: prev.limit || formatNumberInput(targetType?.seed?.limit),
        wager:
          prev.wager !== '' && prev.wager !== null
            ? prev.wager
            : formatNumberInput(targetType?.seed?.wager),
        cashoutCap:
          prev.cashoutCap !== '' && prev.cashoutCap !== null
            ? prev.cashoutCap
            : formatNumberInput(targetType?.seed?.cashoutCap),
        notes: prev.notes || targetType?.seed?.notes || '',
        startsAt:
          prev.startsAt || formatDateInputValue(targetType?.seed?.startsAt ?? seedSchedule.startsAt ?? null),
        endsAt:
          prev.endsAt || formatDateInputValue(targetType?.seed?.endsAt ?? seedSchedule.endsAt ?? null),
        repeatLimit:
          prev.repeatLimit !== '' && prev.repeatLimit !== null
            ? prev.repeatLimit
            : formatNumberInput(repeatSeed?.limit ?? ''),
        repeatDelayHours:
          prev.repeatDelayHours !== '' && prev.repeatDelayHours !== null
            ? prev.repeatDelayHours
            : formatNumberInput(repeatSeed?.delayHours ?? ''),
      };
    });

    setRewardForm({
      ...emptyRewardForm,
      currency:
        typeof rewardSeed.currency === 'string' && rewardSeed.currency
          ? rewardSeed.currency
          : typeof paramsSeed.currency === 'string' && paramsSeed.currency
          ? paramsSeed.currency
          : emptyRewardForm.currency,
      balanceType:
        typeof (rewardSeed.balanceType ?? paramsSeed.balanceType) === 'string'
          ? rewardSeed.balanceType ?? paramsSeed.balanceType
          : emptyRewardForm.balanceType,
      depositEnabled:
        rewardSeed.depositPercent != null ||
        rewardSeed.depositMaxAmount != null ||
        paramsSeed.percent != null ||
        paramsSeed.depositPercent != null,
      depositPercent: formatNumberInput(
        rewardSeed.depositPercent ?? paramsSeed.percent ?? paramsSeed.depositPercent,
      ),
      depositMaxAmount: formatNumberInput(
        rewardSeed.depositMaxAmount ?? paramsSeed.maxBonus ?? paramsSeed.depositMaxAmount,
      ),
      cashEnabled: rewardSeed.cashAmount != null || paramsSeed.cashAmount != null,
      cashAmount: formatNumberInput(rewardSeed.cashAmount ?? paramsSeed.cashAmount ?? ''),
      freeSpinsEnabled:
        rewardSeed.freeSpins != null ||
        paramsSeed.freeSpins != null ||
        paramsSeed.maxFreeSpins != null,
      freeSpins: formatNumberInput(rewardSeed.freeSpins ?? paramsSeed.freeSpins ?? paramsSeed.maxFreeSpins),
      freeSpinsValue: formatNumberInput(rewardSeed.freeSpinsValue ?? paramsSeed.freeSpinsValue ?? ''),
      freeSpinsGame:
        typeof (rewardSeed.freeSpinsGame ?? paramsSeed.freeSpinsGame) === 'string'
          ? rewardSeed.freeSpinsGame ?? paramsSeed.freeSpinsGame
          : '',
      customTextEnabled:
        typeof rewardSeed.customText === 'string' || typeof paramsSeed.customText === 'string',
      customText:
        typeof rewardSeed.customText === 'string'
          ? rewardSeed.customText
          : typeof paramsSeed.customText === 'string'
          ? paramsSeed.customText
          : '',
    });
    setRewardTouched(false);

    setAudienceForm({
      segments: formatListForInput(audienceSeed.segments),
      countries: formatListForInput(audienceSeed.countries),
      levels: formatListForInput(audienceSeed.levels),
      tags: formatListForInput(audienceSeed.tags),
      vipOnly: Boolean(audienceSeed.vipOnly),
      newPlayersOnly: Boolean(audienceSeed.newPlayersOnly),
    });

    setLimitsForm({
      ...emptyLimitsForm,
      minDeposit: formatNumberInput(limitsSeed.minDeposit ?? limitsSeed.depositMin ?? ''),
      maxDeposit: formatNumberInput(limitsSeed.maxDeposit ?? limitsSeed.depositMax ?? ''),
      minBalance: formatNumberInput(limitsSeed.minBalance ?? ''),
      maxBalance: formatNumberInput(limitsSeed.maxBalance ?? ''),
      maxUsagePerClient: formatNumberInput(
        limitsSeed.maxUsagePerClient ?? limitsSeed.usagePerClient ?? '',
      ),
      allowedCurrencies: formatListForInput(limitsSeed.allowedCurrencies ?? limitsSeed.currencies),
      currency:
        typeof limitsSeed.currency === 'string' && limitsSeed.currency.trim()
          ? limitsSeed.currency.trim()
          : emptyLimitsForm.currency,
    });

    setDisplayForm({
      showOnMain: Boolean(displaySeed.showOnMain ?? displaySeed.onMain),
      showInStore: Boolean(displaySeed.showInStore ?? displaySeed.inStore ?? displaySeed.inCatalog ?? true),
      highlight: Boolean(displaySeed.highlight ?? displaySeed.isHighlighted),
      highlightColor:
        typeof displaySeed.highlightColor === 'string' && displaySeed.highlightColor.trim()
          ? displaySeed.highlightColor.trim()
          : DEFAULT_HIGHLIGHT_COLOR,
      badgeText:
        typeof displaySeed.badgeText === 'string' && displaySeed.badgeText.trim()
          ? displaySeed.badgeText.trim()
          : '',
      description:
        typeof displaySeed.description === 'string' && displaySeed.description.trim()
          ? displaySeed.description.trim()
          : '',
      channels: formatListForInput(displaySeed.channels ?? displaySeed.placements),
    });

    setSuccess(null);
    setError(null);
  }, []);

  const handleFieldChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      if (field === 'reward') {
        setRewardTouched(true);
      }
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const handleRewardFormChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      setRewardForm((prev) => ({ ...prev, [field]: value }));
      setRewardTouched(false);
    };
  }, []);

  const handleRewardToggle = useCallback((field, related = []) => {
    return (event) => {
      const checked = event?.target?.checked ?? false;
      setRewardForm((prev) => {
        const next = { ...prev, [field]: checked };
        if (!checked) {
          related.forEach((key) => {
            next[key] = emptyRewardForm[key];
          });
        }
        return next;
      });
      setRewardTouched(false);
    };
  }, []);

  const handleAudienceFieldChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      setAudienceForm((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const handleAudienceToggle = useCallback((field) => {
    return (event) => {
      const checked = event?.target?.checked ?? false;
      setAudienceForm((prev) => ({ ...prev, [field]: checked }));
    };
  }, []);

  const handleLimitsFieldChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      setLimitsForm((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const handleDisplayFieldChange = useCallback((field) => {
    return (event) => {
      const value = event?.target?.value ?? '';
      setDisplayForm((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const handleDisplayToggle = useCallback((field) => {
    return (event) => {
      const checked = event?.target?.checked ?? false;
      setDisplayForm((prev) => ({ ...prev, [field]: checked }));
    };
  }, []);

  const handleResetRewardToPreview = useCallback(() => {
    setRewardTouched(false);
    setFormValues((prev) => ({ ...prev, reward: buildRewardPreview(rewardForm) }));
  }, [rewardForm]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setError(null);
      setSuccess(null);

      if (!formValues.typeId) {
        setError(new Error('Выберите тип промокода.'));
        return;
      }

      const schedule = {
        startsAt: toIsoOrNull(formValues.startsAt),
        endsAt: toIsoOrNull(formValues.endsAt),
      };

      const rewardParams = normalizeRewardParams(rewardForm);
      const audienceParams = composeAudienceParams(audienceForm);
      const limitsParams = composeLimitsParams(limitsForm);
      const displayParams = composeDisplayParams(displayForm);

      const params = {};
      if (Object.keys(rewardParams).length > 0) {
        params.reward = rewardParams;
      }
      if (schedule.startsAt || schedule.endsAt) {
        params.schedule = schedule;
      }
      if (audienceParams) {
        params.audience = audienceParams;
      }
      if (limitsParams) {
        params.limits = limitsParams;
      }
      if (displayParams) {
        params.display = displayParams;
      }

      const repeatLimitValue =
        formValues.repeatLimit === '' || formValues.repeatLimit == null
          ? null
          : Number(formValues.repeatLimit);
      const repeatDelayValue =
        formValues.repeatDelayHours === '' || formValues.repeatDelayHours == null
          ? null
          : Number(formValues.repeatDelayHours);

      if (
        (repeatLimitValue != null && Number.isFinite(repeatLimitValue)) ||
        (repeatDelayValue != null && Number.isFinite(repeatDelayValue))
      ) {
        const repeat = {};
        if (repeatLimitValue != null && Number.isFinite(repeatLimitValue)) {
          repeat.limit = Math.max(0, Math.floor(repeatLimitValue));
        }
        if (repeatDelayValue != null && Number.isFinite(repeatDelayValue)) {
          const safeDelay = Math.max(0, repeatDelayValue);
          repeat.delayHours = Number.isInteger(safeDelay) ? safeDelay : Number(safeDelay.toFixed(2));
        }
        if (Object.keys(repeat).length > 0) {
          params.repeat = repeat;
        }
      }

      const payload = {
        typeId: formValues.typeId,
        code: formValues.code,
        title: formValues.title,
        reward: formValues.reward?.trim?.() ?? '',
        limit: formValues.limit === '' ? null : Number(formValues.limit),
        status: formValues.status,
        wager: formValues.wager === '' ? null : Number(formValues.wager),
        cashoutCap: formValues.cashoutCap === '' ? null : Number(formValues.cashoutCap),
        notes: formValues.notes,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        params,
      };

      if (audienceParams) {
        payload.audience = audienceParams;
      }
      if (limitsParams) {
        payload.limits = limitsParams;
      }
      if (displayParams) {
        payload.display = displayParams;
      }

      setIsSubmitting(true);

      try {
        const created = createAdminPromocode(payload);
        setSuccess(`Промокод ${created.code} успешно создан.`);
        setFormValues((prev) => ({
          ...prev,
          code: '',
        }));
        setRewardTouched(false);
      } catch (err) {
        const message = err instanceof Error ? err : new Error('Не удалось создать промокод');
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, rewardForm, audienceForm, limitsForm, displayForm],
  );

  const summaryGroups = useMemo(() => {
    const groups = [];

    const basics = [
      { label: 'Тип', value: selectedType?.name ?? 'Не выбран' },
      { label: 'Статус', value: formValues.status, kind: 'status' },
      { label: 'Код', value: formValues.code || 'Не задан' },
    ];
    if (formValues.title) {
      basics.push({ label: 'Название', value: formValues.title });
    }
    groups.push({ title: 'Основное', items: basics });

    const periodItems = [];
    if (formValues.startsAt || formValues.endsAt) {
      const periodParts = [];
      if (formValues.startsAt) {
        periodParts.push(`с ${formValues.startsAt}`);
      }
      if (formValues.endsAt) {
        periodParts.push(`до ${formValues.endsAt}`);
      }
      periodItems.push({ label: 'Период действия', value: periodParts.join(' ').trim() });
    }
    if (formValues.repeatLimit || formValues.repeatDelayHours) {
      const parts = [];
      if (formValues.repeatLimit) {
        parts.push(`Повторы: ${formValues.repeatLimit}`);
      }
      if (formValues.repeatDelayHours) {
        parts.push(`Пауза: ${formValues.repeatDelayHours} ч`);
      }
      periodItems.push({ label: 'Повторные активации', value: parts.join(' • ') });
    }
    if (periodItems.length > 0) {
      groups.push({ title: 'Даты и повторы', items: periodItems });
    }

    groups.push({
      title: 'Награда',
      items: [{ label: 'Настройки награды', value: rewardPreview || 'Не настроена' }],
    });

    const conditions = [];
    if (formValues.limit) {
      conditions.push({ label: 'Лимит выдачи', value: formValues.limit });
    }
    if (formValues.wager) {
      conditions.push({ label: 'Вейджер', value: formValues.wager });
    }
    if (formValues.cashoutCap) {
      conditions.push({ label: 'Кеп на вывод', value: formValues.cashoutCap });
    }
    if (limitsPreview) {
      conditions.push({ label: 'Дополнительные ограничения', value: limitsPreview });
    }
    if (conditions.length > 0) {
      groups.push({ title: 'Ограничения', items: conditions });
    }

    groups.push({
      title: 'Аудитория',
      items: [
        {
          label: 'Кому показываем',
          value: audiencePreview || 'Все игроки',
        },
      ],
    });

    if (displayPreview) {
      groups.push({
        title: 'Отображение',
        items: [{ label: 'Каналы и подача', value: displayPreview }],
      });
    }

    if (formValues.notes) {
      groups.push({ title: 'Примечание', items: [{ label: 'Комментарий', value: formValues.notes }] });
    }

    return groups;
  }, [selectedType, formValues, rewardPreview, audiencePreview, limitsPreview, displayPreview]);

  const resetForms = useCallback(() => {
    setFormValues(emptyForm);
    setRewardForm(emptyRewardForm);
    setAudienceForm(emptyAudienceForm);
    setLimitsForm(emptyLimitsForm);
    setDisplayForm(emptyDisplayForm);
    setRewardTouched(false);
    setSuccess(null);
    setError(null);
  }, []);

  return {
    BALANCE_OPTIONS,
    STATUS_OPTIONS,
    formValues,
    rewardForm,
    audienceForm,
    limitsForm,
    displayForm,
    rewardPreview,
    audiencePreview,
    limitsPreview,
    displayPreview,
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
    summaryGroups,
  };
};
