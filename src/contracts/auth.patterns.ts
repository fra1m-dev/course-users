export const USERS_PATTERNS = {
  USERS_CREATE: 'users.create',
  USERS_GET_BY_EMAIL: 'users.getByEmail',
} as const;

export type USERSPattern = (typeof USERS_PATTERNS)[keyof typeof USERS_PATTERNS];
