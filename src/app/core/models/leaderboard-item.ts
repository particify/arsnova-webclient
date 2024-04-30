import { RoomUserAlias } from '@app/core/models/room-user-alias';

export interface LeaderboardItem {
  userAlias: RoomUserAlias;
  score: number;
}
