import { AnswerOption } from './answer-option';
import { Content } from './content';
import { ContentType } from './content-type.enum';

export class ContentChoice extends Content {
  options: AnswerOption[];
  correctOptionIndexes: number[];
  multiple: boolean;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    options: AnswerOption[] = [],
    correctOptionIndexes: number[] = [],
    multiple: boolean = false,
    format: ContentType = ContentType.CHOICE
  ) {
    super(roomId, subject, body, groups, format, {});
    this.options = options;
    this.correctOptionIndexes = correctOptionIndexes;
    this.multiple = multiple;
  }
}
