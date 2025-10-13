import { parseListInput } from './format.js';

export const composeAudienceParams = (audienceForm) => {
  if (!audienceForm) return null;

  const audience = {};
  const segments = parseListInput(audienceForm.segments);
  if (segments.length) {
    audience.segments = segments;
  }

  const countries = parseListInput(audienceForm.countries);
  if (countries.length) {
    audience.countries = countries;
  }

  const levels = parseListInput(audienceForm.levels);
  if (levels.length) {
    audience.levels = levels;
  }

  const tags = parseListInput(audienceForm.tags);
  if (tags.length) {
    audience.tags = tags;
  }

  if (audienceForm.vipOnly) {
    audience.vipOnly = true;
  }

  if (audienceForm.newPlayersOnly) {
    audience.newPlayersOnly = true;
  }

  return Object.keys(audience).length ? audience : null;
};

export const buildAudiencePreview = (audienceForm) => {
  const audience = composeAudienceParams(audienceForm);
  if (!audience) return '';

  const parts = [];
  if (audience.segments?.length) {
    parts.push(`Сегменты: ${audience.segments.join(', ')}`);
  }
  if (audience.countries?.length) {
    parts.push(`Страны: ${audience.countries.join(', ')}`);
  }
  if (audience.levels?.length) {
    parts.push(`Уровни: ${audience.levels.join(', ')}`);
  }
  if (audience.tags?.length) {
    parts.push(`Теги: ${audience.tags.join(', ')}`);
  }
  if (audience.vipOnly) {
    parts.push('Только VIP');
  }
  if (audience.newPlayersOnly) {
    parts.push('Только новые игроки');
  }

  return parts.join(' • ');
};
