import { RemoteMessage } from '@arsnova/app/models/events/remote/remote-message.enum';

export interface UiState {
  contentId: string,
  resultsVisible: boolean,
  correctAnswersVisible: boolean,
  timeout: boolean
}

export class UiStateChangedEvent {
  type: string;
  payload: UiState;

  constructor(contentId: string, resultsVisible: boolean, correctAnswersVisible: boolean, timeout: boolean) {
    this.type = RemoteMessage.UI_STATE_CHANGED;
    this.payload = {
      contentId: contentId,
      resultsVisible: resultsVisible,
      correctAnswersVisible: correctAnswersVisible,
      timeout: timeout
    };
  }
}
