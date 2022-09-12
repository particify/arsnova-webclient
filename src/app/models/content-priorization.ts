import { AnswerOption } from './answer-option';
import { ContentChoice } from './content-choice';
import { ContentState } from './content-state';
import { ContentType } from './content-type.enum';

export class ContentPriorization extends ContentChoice {
  assignablePoints: number;

  constructor(id: string,
    revision: string,
    roomId: string,
    subject: string,
    body: string,
    groups: string[],
    options: AnswerOption[],
    format: ContentType,
    state: ContentState,
    assignablePoints: number) {
  super(
      id,
      revision,
      roomId,
      subject,
      body,
      groups,
      options,
      [],
      false,
      format,
      state);
  this.assignablePoints = assignablePoints;
}
}