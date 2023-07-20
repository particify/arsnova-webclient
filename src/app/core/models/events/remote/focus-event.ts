import { ContentFocusState } from './content-focus-state';
import { CommentFocusState } from './comment-focus-state';
import { FeedbackFocusState } from './feedback-focus-state';

export class FocusEvent {
  feature: string;
  focusState?: ContentFocusState | CommentFocusState | FeedbackFocusState;

  constructor(
    feature: string,
    focusState?: ContentFocusState | CommentFocusState | FeedbackFocusState
  ) {
    this.feature = feature || 'UNSET';
    this.focusState = focusState;
  }
}
