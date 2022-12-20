export class UiState {
  contentId: string;
  resultsVisible: boolean;
  correctAnswersVisible: boolean;
  timeout: boolean

  constructor(contentId: string, resultsVisible: boolean, correctAnswersVisible: boolean, timeout: boolean) {
    this.contentId = contentId;
    this.resultsVisible = resultsVisible;
    this.correctAnswersVisible = correctAnswersVisible;
    this.timeout = timeout;
  }
}
