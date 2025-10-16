export interface RankLevelRow {
  id: string;
  level: number;
  slug: string;
  label: string;
  short_label: string;
  group: string;
  tier: number;
  deposit_step: number;
  total_deposit: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RankRewardRow {
  id: string;
  rank_level_id: string;
  level: number;
  label: string;
  badge_color: string;
  badge_color_secondary: string;
  badge_color_tertiary: string;
  badge_text_color: string;
  badge_effect: string;
  badge_effect_speed: number;
  tagline: string;
  description: string;
  purpose: string;
  created_at: string;
  updated_at: string;
}

export interface RankLevel {
  id: string;
  level: number;
  slug: string;
  label: string;
  shortLabel: string;
  group: string;
  tier: number;
  depositStep: number;
  totalDeposit: number;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RankReward {
  id: string;
  rankLevelId: string;
  level: number;
  label: string;
  badgeColor: string;
  badgeColorSecondary: string;
  badgeColorTertiary: string;
  badgeTextColor: string;
  badgeEffect: string;
  badgeEffectSpeed: number;
  tagline: string;
  description: string;
  purpose: string;
  createdAt: string | null;
  updatedAt: string | null;
}
