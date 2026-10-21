import { ContentDetailsFragment } from '@gql/generated/graphql';
import { PresentationStepPosition } from './presentation-step-position.enum';

export class ContentPresentationState {
  position: PresentationStepPosition;
  index: number;
  content: ContentDetailsFragment;

  constructor(
    position: PresentationStepPosition,
    index: number,
    content: ContentDetailsFragment
  ) {
    this.position = position;
    this.index = index;
    this.content = content;
  }
}
