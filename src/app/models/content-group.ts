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
    id: string = '',
    revision: string = '',
    roomId: string = '',
    name: string = '',
    contentIds: string[] = [],
    published: boolean = false,
    firstPublishedIndex: number = -1,
    lastPublishedIndex: number = -1,
    statisticsPublished: boolean = false,
    correctOptionsPublished: boolean = false,
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
