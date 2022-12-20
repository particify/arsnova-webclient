import { ContentFocusState } from './content-focus-state';
import { CommentFocusState } from './comment-focus-state';
import { FeedbackFocusState } from './feedback-focus-state';

export class FocusEvent {
  feature: string;
  focusState: ContentFocusState | CommentFocusState | FeedbackFocusState;
  guided: boolean;

  constructor(
    feature: string,
    focusState: ContentFocusState | CommentFocusState | FeedbackFocusState,
    guided: boolean
  ) {
    this.feature = feature || 'UNSET';
    this.focusState = focusState;
    this.guided = guided;
  }
}
