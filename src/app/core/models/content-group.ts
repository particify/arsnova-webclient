// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class ContentGroup {
  id!: string;
  revision!: string;
  roomId: string;
  name: string;
  contentIds: string[];
  statisticsPublished: boolean;
  correctOptionsPublished: boolean;
  published: boolean;
  publishingMode: PublishingMode;
  publishingIndex: number;
  groupType: GroupType;
  leaderboardEnabled: boolean;

  constructor(
    roomId = '',
    name = '',
    contentIds: string[] = [],
    statisticsPublished = true,
    correctOptionsPublished = true,
    published = false,
    publishingMode = PublishingMode.ALL,
    publishingIndex = 0,
    groupType = GroupType.MIXED,
    leaderboardEnabled = true
  ) {
    this.roomId = roomId;
    this.name = name;
    this.contentIds = contentIds;
    this.statisticsPublished = statisticsPublished;
    this.correctOptionsPublished = correctOptionsPublished;
    this.published = published;
    this.publishingMode = publishingMode;
    this.publishingIndex = publishingIndex;
    this.groupType = groupType;
    this.leaderboardEnabled = leaderboardEnabled;
  }
}

export enum PublishingMode {
  ALL = 'ALL',
  UP_TO = 'UP_TO',
  LIVE = 'LIVE',
}

export interface PublishingModeItem {
  type: PublishingMode;
  name: string;
  icon: string;
}

export const PUBLISHING_MODE_ITEMS: PublishingModeItem[] = [
  { type: PublishingMode.ALL, name: 'all', icon: 'lock_open' },
  { type: PublishingMode.UP_TO, name: 'up-to', icon: 'expand_all' },
];

export enum GroupType {
  MIXED = 'MIXED',
  QUIZ = 'QUIZ',
  SURVEY = 'SURVEY',
  FLASHCARDS = 'FLASHCARDS',
}
