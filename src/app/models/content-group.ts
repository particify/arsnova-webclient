export class ContentGroup {
  id: string;
  revision: string;
  roomId: string;
  name: string;
  contentIds: string[];
  autoSort: boolean;

  constructor(
    id: string = '',
    revision: string = '',
    roomId: string = '',
    name: string = '',
    contentIds: string[] = [],
    autoSort: boolean = false
  ) {
    this.id = id;
    this.revision = revision;
    this.roomId = roomId;
    this.name = name;
    this.contentIds = contentIds;
    this.autoSort = autoSort;
  }
}
