export class ContentFocusState {
  contentId: string;
  contentGroupId: string;
  resultsVisible: boolean;
  correctAnswersVisible: boolean;

  constructor(contentId, contentGroupId, resultsVisible, correctAnswersVisible) {
    this.contentId = contentId;
    this.contentGroupId = contentGroupId;
    this.resultsVisible = resultsVisible;
    this.correctAnswersVisible = correctAnswersVisible;
  }
}
