import { Content } from '@gql/generated/graphql';
import { PresentationStepPosition } from './presentation-step-position.enum';

export class ContentPresentationState {
  position: PresentationStepPosition;
  index: number;
  content: Content;

  constructor(
    position: PresentationStepPosition,
    index: number,
    content: Content
  ) {
    this.position = position;
    this.index = index;
    this.content = content;
  }
}
