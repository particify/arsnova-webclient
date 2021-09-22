export class ContentGroupChangedEvent {
  type: string;
  payload: {
    contentGroupId: string
  };

  constructor(contentGroupId: string) {
    this.type = 'ContentGroupChanged';
    this.payload = {
      contentGroupId: contentGroupId
    };
  }
}
