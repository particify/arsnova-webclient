import { RoomRole } from '@gql/generated/graphql';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Membership {
  roomId!: string;
  roomShortId!: string;
  roles: RoomRole[] = [];
  primaryRole!: RoomRole;
  lastVisit!: string;
}
