import { UserRole } from './user-roles.enum';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Membership {
  roomId!: string;
  roomShortId!: string;
  roles: UserRole[] = [];
  primaryRole!: UserRole;
  lastVisit!: string;
}
