import { AnswerOption } from './answer-option';
import { Content } from './content';
import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

export class ContentChoice extends Content {
  options: AnswerOption[];
  correctOptionIndexes: number[];
  multiple: boolean;

  constructor(id: string,
              revision: string,
              roomId: string,
              subject: string,
              body: string,
              groups: string[],
              options: AnswerOption[],
              correctOptionIndexes: number[],
              multiple: boolean,
              format: ContentType,
              state: ContentState) {
    super(id,
      revision,
      roomId,
      subject,
      body,
      groups,
      format,
      new Map(),
      state);
    this.options = options;
    this.correctOptionIndexes = correctOptionIndexes;
    this.multiple = multiple;
  }
}
