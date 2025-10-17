export interface AuthUserMetadata {
  role?: string;
  roleId?: string;
  roleLevel?: number;
  roles?: ReadonlyArray<string>;
  isAdmin?: boolean;
  playerRankId?: string;
  playerRankTier?: number;
  playerRankBenefits?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface AuthUserRow {
  id: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  role?: string;
  role_id?: string;
  roleId?: string;
  role_level?: number | null;
  roleLevel?: number | null;
  roles?: string[];
  created_at: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: AuthUserMetadata;
  user_metadata: AuthUserMetadata;
  [key: string]: unknown;
}

export interface AuthUserRecord extends AuthUserRow {
  roles: ReadonlyArray<string>;
  app_metadata: Readonly<AuthUserMetadata>;
  user_metadata: Readonly<AuthUserMetadata>;
  raw: Readonly<Record<string, unknown>>;
}

export interface AuthUsersSnapshot {
  records: ReadonlyArray<AuthUserRecord>;
  byId: ReadonlyMap<string, AuthUserRecord>;
  byEmail: ReadonlyMap<string, AuthUserRecord>;
  byPhone: ReadonlyMap<string, AuthUserRecord>;
}
