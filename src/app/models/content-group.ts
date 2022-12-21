export class ContentGroup {
  id: string;
  revision: string;
  roomId: string;
  name: string;
  contentIds: string[];
  published: boolean;
  firstPublishedIndex: number;
  lastPublishedIndex: number;
  statisticsPublished: boolean;
  correctOptionsPublished: boolean;

  constructor(
    id = '',
    revision = '',
    roomId = '',
    name = '',
    contentIds: string[] = [],
    published = false,
    firstPublishedIndex = 0,
    lastPublishedIndex = -1,
    statisticsPublished = true,
    correctOptionsPublished = true
  ) {
    this.id = id;
    this.revision = revision;
    this.roomId = roomId;
    this.name = name;
    this.contentIds = contentIds;
    this.published = published;
    this.firstPublishedIndex = firstPublishedIndex;
    this.lastPublishedIndex = lastPublishedIndex;
    this.statisticsPublished = statisticsPublished;
    this.correctOptionsPublished = correctOptionsPublished;
  }
}
