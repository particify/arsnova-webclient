import { Content } from './content';
import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

export class ContentWordcloud extends Content {
  maxAnswers: number;

  constructor(
      id: string,
      revision: string,
      roomId: string,
      subject: string,
      body: string,
      groups: string[],
      format: ContentType,
      state: ContentState,
      maxAnswers: number) {
    super(
        id,
        revision,
        roomId,
        subject,
        body,
        groups,
        format,
        {},
        state);
    this.maxAnswers = maxAnswers;
  }
}
