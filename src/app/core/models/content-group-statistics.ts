import { GroupType } from '@app/core/models/content-group';

export interface ContentGroupStatistics {
  id: string;
  groupName: string;
  contentCount: number;
  groupType: GroupType;
}
