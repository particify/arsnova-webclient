import { UserRole } from './user-roles.enum'

export class Membership {
  roomId: string;
  roomShortId: string;
  roles: UserRole[] = [];
  primaryRole: UserRole;
  lastVisit: string;
}
