export type AuthRole = 'owner' | 'admin' | 'user' | (string & {});

export interface AuthUserMetadata {
  role?: AuthRole;
  roleId?: string;
  roleLevel?: number;
  roles?: ReadonlyArray<AuthRole>;
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
  role?: AuthRole;
  role_id?: string;
  roleId?: string;
  role_level?: number | null;
  roleLevel?: number | null;
  roles?: AuthRole[];
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
  roles: ReadonlyArray<AuthRole>;
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
