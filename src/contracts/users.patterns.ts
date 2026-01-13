export const USERS_PATTERNS = {
  /** 'users.create' */
  CREATE: 'users.create',
  /** 'users.getByEmail' */
  GET_BY_EMAIL: 'users.getByEmail',
  /** 'users.getAll' */
  GET_ALL: 'users.getAll',
  /** 'users.getUserById' */
  BY_ID: 'users.getUserById',
  /** 'user.getStats' */
  GET_STATS: 'users.getStats',
  /**'user.applyQuizStats'*/
  APPLY_QUIZ_STATS: 'users.applyQuizStats',
} as const;

export type USERSPattern = (typeof USERS_PATTERNS)[keyof typeof USERS_PATTERNS];
