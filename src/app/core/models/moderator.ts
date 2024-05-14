import { UserRole } from './user-roles.enum';

export class Moderator {
  userId: string;
  displayId: string;
  role: UserRole;

  constructor(
    userId = '',
    displayId = '',
    role: UserRole = UserRole.MODERATOR
  ) {
    this.userId = userId;
    this.displayId = displayId;
    this.role = role;
  }
}
