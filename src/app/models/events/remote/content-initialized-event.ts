import { ContentFocusState } from './content-focus-state';
import { RemoteMessage } from './remote-message.enum';

export class ContentInitializedEvent {
  type: string;
  payload: ContentFocusState;

  constructor(payload: ContentFocusState) {
    this.type = RemoteMessage.CONTENT_INITIALIZED;
    this.payload = payload;
  }
}
