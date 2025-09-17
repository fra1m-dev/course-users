//TODO: удалить password из dto и юзать только в сервисе auth

import { Role } from '@fra1m-dev/contracts-auth';

export type UserListItemDto =
  | { id: number; name: string; role: Role; email: string; password?: never }
  | { id: number; name: string; role: Role; email: ''; password?: never }
  | { id: number; name: string; role: Role; email: string; password: string };
