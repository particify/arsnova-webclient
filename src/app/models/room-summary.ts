export class RoomSummaryState {
  locked: boolean;
  moderated: boolean;
  guided: boolean;
}

export class RoomSummaryStats {
  roomUserCount: number;
  contentCount: number;
  ackCommentCount: number;
}

export class RoomSummaryFeatures {

}

export class RoomSummary {
  id: string;
  shortId: string;
  name: string;
  stats: RoomSummaryStats;
  state: RoomSummaryState;
  features: RoomSummaryFeatures;
}
