import './badgeEffects.css';

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const DEFAULT_BADGE_COLOR = '#adb5bd';
const DEFAULT_SECONDARY_COLOR = '#ced4da';
const DEFAULT_TERTIARY_COLOR = '#6c757d';
const DEFAULT_TEXT_LIGHT = '#ffffff';
const DEFAULT_TEXT_DARK = '#212529';
const DEFAULT_EFFECT_SPEED = 6;

const EFFECT_VALUES = ['solid', 'gradient', 'rainbow', 'breathing', 'pulse', 'glow', 'shine'];

const sanitizeHex = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR_REGEX.test(prefixed)) {
    return null;
  }
  if (prefixed.length === 4) {
    const [, r, g, b] = prefixed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return prefixed;
};

const toRgb = (hex) => {
  const normalized = sanitizeHex(hex);
  if (!normalized) {
    return null;
  }
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }
  return { r, g, b };
};

export const resolveAutoTextColor = (hex) => {
  const rgb = toRgb(hex);
  if (!rgb) {
    return DEFAULT_TEXT_LIGHT;
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.65 ? DEFAULT_TEXT_DARK : DEFAULT_TEXT_LIGHT;
};

export const normalizeHexColor = (value, fallback = DEFAULT_BADGE_COLOR) => {
  const candidate = sanitizeHex(value);
  if (candidate) {
    return candidate;
  }
  const fallbackCandidate = sanitizeHex(fallback);
  if (fallbackCandidate) {
    return fallbackCandidate;
  }
  return DEFAULT_BADGE_COLOR;
};

export const normalizeBadgeEffect = (effect) => {
  if (typeof effect !== 'string') {
    return EFFECT_VALUES[0];
  }
  const value = effect.trim().toLowerCase();
  return EFFECT_VALUES.includes(value) ? value : EFFECT_VALUES[0];
};

export const normalizeBadgeSpeed = (value, fallback = DEFAULT_EFFECT_SPEED) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  const clamped = Math.min(Math.max(numeric, 2), 12);
  return Math.round(clamped * 10) / 10;
};

export const BADGE_EFFECT_OPTIONS = [
  { value: 'solid', label: 'Статичный цвет', requiresSecondary: false, requiresTertiary: false },
  { value: 'gradient', label: 'Градиент', requiresSecondary: true, requiresTertiary: true },
  { value: 'rainbow', label: 'Радуга', requiresSecondary: false, requiresTertiary: false },
  { value: 'breathing', label: 'Дыхание', requiresSecondary: true, requiresTertiary: false },
  { value: 'pulse', label: 'Пульсация', requiresSecondary: true, requiresTertiary: false },
  { value: 'glow', label: 'Свечение', requiresSecondary: true, requiresTertiary: false },
  { value: 'shine', label: 'Блик', requiresSecondary: false, requiresTertiary: false },
];

export const getBadgeEffectMeta = (value) => {
  const normalized = normalizeBadgeEffect(value);
  return BADGE_EFFECT_OPTIONS.find((option) => option.value === normalized) ?? BADGE_EFFECT_OPTIONS[0];
};

export const buildBadgePreview = (config = {}) => {
  const baseColor = normalizeHexColor(config.badgeColor, DEFAULT_BADGE_COLOR);
  const secondaryColor = normalizeHexColor(config.badgeColorSecondary, baseColor);
  const tertiaryColor = normalizeHexColor(config.badgeColorTertiary, secondaryColor);
  const effect = normalizeBadgeEffect(config.badgeEffect);
  const speed = normalizeBadgeSpeed(config.badgeEffectSpeed, DEFAULT_EFFECT_SPEED);

  const textFallback = resolveAutoTextColor(baseColor);
  const textColor = normalizeHexColor(config.badgeTextColor, textFallback);

  const style = {
    '--rank-badge-base-color': baseColor,
    '--rank-badge-secondary-color': secondaryColor,
    '--rank-badge-tertiary-color': tertiaryColor,
    '--rank-badge-text-color': textColor,
    '--rank-badge-speed': `${speed}s`,
    '--bs-badge-bg': baseColor,
    '--bs-badge-color': textColor,
    '--bs-badge-border-color': baseColor,
    '--bs-bg-opacity': 1,
    color: textColor,
  };

  return {
    className: `rank-badge rank-badge--${effect}`,
    style,
    effect,
    textColor,
    speed,
    colors: {
      base: baseColor,
      secondary: secondaryColor,
      tertiary: tertiaryColor,
    },
  };
};

export const formatHexInputValue = (value, fallback) => normalizeHexColor(value, fallback);

export const RANK_BADGE_DEFAULTS = {
  base: DEFAULT_BADGE_COLOR,
  secondary: DEFAULT_SECONDARY_COLOR,
  tertiary: DEFAULT_TERTIARY_COLOR,
  text: DEFAULT_TEXT_LIGHT,
  speed: DEFAULT_EFFECT_SPEED,
};
