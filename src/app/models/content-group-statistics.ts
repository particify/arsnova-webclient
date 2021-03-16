export class ContentGroupStatistics {
  id: string;
  groupName: string;
  contentCount: number;

  constructor(
    id: string,
    groupName: string,
    contentCount: number
  ) {
    this.id = id;
    this.groupName = groupName;
    this.contentCount = contentCount;
  }
}
