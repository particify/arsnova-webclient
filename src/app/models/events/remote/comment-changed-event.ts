export class CommentChangedEvent {
  type: string;
  payload: {
    commentId: string;
  };

  constructor(commentId: string) {
    this.type = 'CommentIdChanged';
    this.payload = {
      commentId: commentId
    };
  }
}
