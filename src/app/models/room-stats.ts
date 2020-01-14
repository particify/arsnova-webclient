import { ContentGroupStatistics } from './content-group-statistics';

export class RoomStats {
  groupStats: ContentGroupStatistics[];
  currentParticipants: number;
  contentCount: number;
  answerCount: number;
  commentCount: number;

  constructor(
    contentGroupStatistics: ContentGroupStatistics[] = [],
    currentParticipants: number,
    contentCount: number,
    answerCount: number,
    commentCount: number
  ) {
    this.groupStats = contentGroupStatistics;
    this.currentParticipants = currentParticipants;
    this.contentCount = contentCount;
    this.answerCount = answerCount;
    this.commentCount = commentCount;
  }
}
