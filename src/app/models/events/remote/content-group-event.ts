export class ContentGroupEvent {
  type: string;
  payload: {
    contentGroupId: string;
  };

  constructor(contentGroupId: string) {
    this.type = 'ChangeContentGroup';
    this.payload = {
      contentGroupId: contentGroupId
    };
  }
}
