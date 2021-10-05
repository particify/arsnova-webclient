import { ContentFocusState } from './content-focus-state';
import { CommentFocusState } from './comment-focus-state';
import { SurveyFocusState } from './survey-focus-state';

export class FocusEvent {
  feature: string;
  focusState: ContentFocusState | CommentFocusState | SurveyFocusState;

  constructor(feature: string, focusState: ContentFocusState | CommentFocusState | SurveyFocusState) {
    this.feature = feature;
    this.focusState = focusState;
  }
}
