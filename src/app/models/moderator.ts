import { UserRole } from './user-roles.enum';

export class Moderator {
  userId: string;
  loginId: string;
  role: UserRole;

  constructor(userId = '', loginId = '', role: UserRole = UserRole.MODERATOR) {
    this.userId = userId;
    this.loginId = loginId;
    this.role = role;
  }
}
