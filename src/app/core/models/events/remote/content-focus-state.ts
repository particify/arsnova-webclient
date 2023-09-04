export class ContentFocusState {
  contentId: string;
  contentIndex: number;
  contentGroupId: string;
  contentGroupName: string;

  constructor(
    contentId: string,
    contentIndex: number,
    contentGroupId: string,
    contentGroupName: string
  ) {
    this.contentId = contentId;
    this.contentIndex = contentIndex;
    this.contentGroupId = contentGroupId;
    this.contentGroupName = contentGroupName;
  }
}
