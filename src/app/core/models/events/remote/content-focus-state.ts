export class ContentFocusState {
  contentId: string;
  contentIndex: number;
  contentGroupId: string;
  contentGroupName: string;

  constructor(contentId, contentIndex, contentGroupId, contentGroupName) {
    this.contentId = contentId;
    this.contentIndex = contentIndex;
    this.contentGroupId = contentGroupId;
    this.contentGroupName = contentGroupName;
  }
}
