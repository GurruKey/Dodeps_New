import type { AuthUserRecord } from './auth';

export interface ClientProfileRow {
  id: string;
  nickname: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string | null;
  phone: string;
  country: string;
  city: string;
  address: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  balance: number;
  casino_balance: number;
  currency: string;
  updated_at: string | null;
  [key: string]: unknown;
}

export interface ClientProfileExtras {
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
  verificationRequests: ReadonlyArray<unknown>;
  verificationUploads: ReadonlyArray<unknown>;
  transactions: ReadonlyArray<unknown>;
}

export interface ClientProfileRecord extends ClientProfileExtras {
  id: string;
  updatedAt: string | null;
  raw: Readonly<ClientProfileRow>;
}

export interface ClientsSnapshot {
  records: ReadonlyArray<AuthUserRecord>;
  profiles: ReadonlyArray<ClientProfileRecord>;
  byId: ReadonlyMap<string, AuthUserRecord>;
  byEmail: ReadonlyMap<string, AuthUserRecord>;
  byPhone: ReadonlyMap<string, AuthUserRecord>;
  profilesById: ReadonlyMap<string, ClientProfileRecord>;
}
