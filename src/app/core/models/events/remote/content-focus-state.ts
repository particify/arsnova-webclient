export class ContentFocusState {
  contentId: string;
  contentIndex: number;
  contentGroupId: string;
  contentGroupName: string;
  resultsVisible: boolean;
  correctAnswersVisible: boolean;

  constructor(
    contentId,
    contentIndex,
    contentGroupId,
    contentGroupName,
    resultsVisible,
    correctAnswersVisible
  ) {
    this.contentId = contentId;
    this.contentIndex = contentIndex;
    this.contentGroupId = contentGroupId;
    this.contentGroupName = contentGroupName;
    this.resultsVisible = resultsVisible;
    this.correctAnswersVisible = correctAnswersVisible;
  }
}
