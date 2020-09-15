import { UserRole } from './user-roles.enum';

export class RoomAccess {
  roomId: string;
  userId: string;
  role: UserRole;
}
