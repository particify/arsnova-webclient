import { AnswerOption } from './answer-option';
import { ContentChoice } from './content-choice';
import { ContentType } from './content-type.enum';

export class ContentPrioritization extends ContentChoice {
  assignablePoints: number;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    options: AnswerOption[] = [],
    format: ContentType = ContentType.PRIORITIZATION,
    assignablePoints: number = 100
  ) {
    super(roomId, subject, body, groups, options, [], false, format);
    this.assignablePoints = assignablePoints;
  }
}
