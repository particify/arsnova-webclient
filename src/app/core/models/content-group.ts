// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class ContentGroup {
  id!: string;
  revision!: string;
  roomId: string;
  name: string;
  contentIds: string[];
  statisticsPublished: boolean;
  correctOptionsPublished: boolean;
  publishingMode: PublishingMode;
  publishingIndex: number;
  groupType: GroupType;

  constructor(
    roomId = '',
    name = '',
    contentIds: string[] = [],
    statisticsPublished = true,
    correctOptionsPublished = true,
    publishingMode = PublishingMode.NONE,
    publishingIndex = 0,
    groupType = GroupType.MIXED
  ) {
    this.roomId = roomId;
    this.name = name;
    this.contentIds = contentIds;
    this.statisticsPublished = statisticsPublished;
    this.correctOptionsPublished = correctOptionsPublished;
    this.publishingMode = publishingMode;
    this.publishingIndex = publishingIndex;
    this.groupType = groupType;
  }
}

export enum PublishingMode {
  NONE = 'NONE',
  ALL = 'ALL',
  UP_TO = 'UP_TO',
  SINGLE = 'SINGLE',
}

export interface PublishingModeItem {
  type: PublishingMode;
  name: string;
  icon: string;
}

export const PUBLISHING_MODE_ITEMS: PublishingModeItem[] = [
  { type: PublishingMode.NONE, name: 'none', icon: 'lock' },
  { type: PublishingMode.ALL, name: 'all', icon: 'lock_open' },
  { type: PublishingMode.UP_TO, name: 'up-to', icon: 'expand_all' },
  { type: PublishingMode.SINGLE, name: 'single', icon: 'play_circle' },
];

export enum GroupType {
  MIXED = 'MIXED',
  QUIZ = 'QUIZ',
  SURVEY = 'SURVEY',
  FLASHCARDS = 'FLASHCARDS',
}
