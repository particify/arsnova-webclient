import { UiState } from './ui-state-changed-event';

export class UiStateEvent {
  type: string;
  payload: UiState;

  constructor(contentId: string, resultsVisible: boolean, correctAnswersVisible: boolean, timeout: boolean) {
    this.type = 'ChangeUiState';
    this.payload = {
      contentId: contentId,
      resultsVisible: resultsVisible,
      correctAnswersVisible: correctAnswersVisible,
      timeout: timeout
    };
  }
}
