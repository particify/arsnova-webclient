import { ContentFocusState } from './content-focus-state';
import { CommentFocusState } from './comment-focus-state';

export class FocusEvent {
  feature: string;
  focusState: ContentFocusState | CommentFocusState;

  constructor(feature: string, focusState: ContentFocusState | CommentFocusState) {
    this.feature = feature;
    this.focusState = focusState;
  }
}
