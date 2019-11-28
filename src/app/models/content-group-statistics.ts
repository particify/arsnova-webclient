export class ContentGroupStatistics {
    groupName: string;
    contentCount: number;

    constructor(
        groupName: string,
        contentCount: number
    ) {
        this.groupName = groupName;
        this.contentCount = contentCount;
    }
  }
