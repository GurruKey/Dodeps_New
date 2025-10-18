export const LEGACY_LS_KEY = 'dodepus_auth_v1';

export const PROFILE_KEY = (uid) => `dodepus_profile_v1:${uid}`;

export { AUTH_USERS_TABLE, PROFILES_TABLE } from '../shared/index.js';

export { DEFAULT_AUTH_STATUS } from './statuses.js';
