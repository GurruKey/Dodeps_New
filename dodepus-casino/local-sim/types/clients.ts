export interface AuthUserMetadata {
  role?: string;
  roleId?: string;
  roleLevel?: number;
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
  created_at: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  last_sign_in_at: string | null;
  status: string;
  role?: string;
  roleLevel?: number;
  roles?: string[];
  app_metadata: AuthUserMetadata;
  user_metadata: AuthUserMetadata;
  [key: string]: unknown;
}

export interface AuthUserRecord extends AuthUserRow {
  roles: ReadonlyArray<string>;
  app_metadata: Readonly<AuthUserMetadata>;
  user_metadata: Readonly<AuthUserMetadata>;
  raw: Readonly<AuthUserRow>;
}

export interface ClientProfileRow {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | null;
  phone: string;
  country: string;
  city: string;
  address: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  balance: number;
  casinoBalance: number;
  currency: string;
  verificationUploads: unknown[];
  verificationRequests: unknown[];
  transactions: unknown[];
  updatedAt: string | null;
  [key: string]: unknown;
}

export interface ClientProfileRecord extends ClientProfileRow {
  verificationUploads: ReadonlyArray<unknown>;
  verificationRequests: ReadonlyArray<unknown>;
  transactions: ReadonlyArray<unknown>;
  raw: Readonly<ClientProfileRow>;
}

export interface ClientsSnapshot {
  records: ReadonlyArray<AuthUserRecord>;
  profiles: ReadonlyArray<ClientProfileRecord>;
  byId: Map<string, AuthUserRecord>;
  byEmail: Map<string, AuthUserRecord>;
  byPhone: Map<string, AuthUserRecord>;
  profilesById: Map<string, ClientProfileRecord>;
}
