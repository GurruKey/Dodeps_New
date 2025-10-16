import type { AuthUserRecord } from './clients';

export interface AuthUsersSnapshot {
  records: ReadonlyArray<AuthUserRecord>;
  byId: Map<string, AuthUserRecord>;
  byEmail: Map<string, AuthUserRecord>;
  byPhone: Map<string, AuthUserRecord>;
}
