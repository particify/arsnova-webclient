import { PresentationStepPosition } from './presentation-step-position.enum';

export class CommentPresentationState {
  stepState: PresentationStepPosition;
  commentId: string;

  constructor(step: PresentationStepPosition, commentId: string) {
    this.stepState = step;
    this.commentId = commentId;
  }
}
