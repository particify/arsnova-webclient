export class Vote {
  userId: string;
  commentId: string;
  vote: number;

  constructor(userId: string = '', commentId: string = '', vote: number = 0) {
    this.userId = userId;
    this.commentId = commentId;
    this.vote = vote;
  }
}
