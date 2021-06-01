export class ContentChangedEvent {
  type: string;
  payload: {
    contentId: string
    contentGroupId: string
  };

  constructor(contentId: string, contentGroupId: string) {
    this.type = 'ContentIdChanged';
    this.payload = {
      contentId: contentId,
      contentGroupId: contentGroupId
    };
  }
}
