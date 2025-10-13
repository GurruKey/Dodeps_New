import { parseListInput } from './format.js';

export const composeDisplayParams = (displayForm) => {
  if (!displayForm) return null;

  const display = {};
  if (displayForm.showOnMain) {
    display.showOnMain = true;
  }
  if (displayForm.showInStore) {
    display.showInStore = true;
  }
  if (displayForm.highlight) {
    display.highlight = true;
  }
  if (displayForm.highlightColor && displayForm.highlightColor.trim()) {
    display.highlightColor = displayForm.highlightColor.trim();
  }
  if (displayForm.badgeText && displayForm.badgeText.trim()) {
    display.badgeText = displayForm.badgeText.trim();
  }
  if (displayForm.description && displayForm.description.trim()) {
    display.description = displayForm.description.trim();
  }

  const channels = parseListInput(displayForm.channels);
  if (channels.length) {
    display.channels = channels;
  }

  return Object.keys(display).length ? display : null;
};

export const buildDisplayPreview = (displayForm) => {
  const display = composeDisplayParams(displayForm);
  if (!display) return '';

  const parts = [];
  if (display.highlight) {
    parts.push('Подсветка промо');
  }
  if (display.highlightColor) {
    parts.push(`Цвет: ${display.highlightColor}`);
  }
  if (display.showOnMain) {
    parts.push('Показать на главной');
  }
  if (display.showInStore) {
    parts.push('Отобразить в магазине');
  }
  if (display.badgeText) {
    parts.push(`Бейдж: ${display.badgeText}`);
  }
  if (display.channels?.length) {
    parts.push(`Каналы: ${display.channels.join(', ')}`);
  }

  return parts.join(' • ');
};
