import { Role } from '@fra1m-dev/contracts-auth';

export type UserListItemDto = {
  id: number;
  name: string;
  role: Role;
  email: string;
};
