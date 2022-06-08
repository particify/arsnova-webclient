import { UserRole } from './user-roles.enum';

export class Moderator {
  userId: string;
  loginId: string;
  role: UserRole;

  constructor(
    userId: string = '',
    loginId: string = '',
    role: UserRole = UserRole.EXECUTIVE_MODERATOR
  ) {
    this.userId = userId;
    this.loginId = loginId;
    this.role = role;
  }
}
