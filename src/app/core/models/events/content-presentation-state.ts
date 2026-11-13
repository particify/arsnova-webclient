import { ContentDetailsFragment } from '@gql/generated/graphql';
import { PresentationStepPosition } from './presentation-step-position.enum';

export class ContentPresentationState {
  position: PresentationStepPosition;
  index: number;
  stepCount: number;
  /** Absent on a step which presents no content, such as the attributions. */
  content?: ContentDetailsFragment;

  constructor(
    position: PresentationStepPosition,
    index: number,
    stepCount: number,
    content?: ContentDetailsFragment
  ) {
    this.position = position;
    this.index = index;
    this.stepCount = stepCount;
    this.content = content;
  }
}
