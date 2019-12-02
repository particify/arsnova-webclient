export class ContentGroup {
  id: string;
  revision: string;
  name: string;
  contentIds: string[];
  autoSort: boolean;

  constructor(
    id: string,
    revision: string,
    name: string,
    contentIds: string[],
    autoSort: boolean
  ) {
    this.id = id;
    this.revision = revision;
    this.name = name;
    this.contentIds = contentIds;
    this.autoSort = autoSort;
  }
}
