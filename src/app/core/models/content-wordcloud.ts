import { Content } from './content';
import { ContentType } from './content-type.enum';

export class ContentWordcloud extends Content {
  maxAnswers: number;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    format: ContentType = ContentType.WORDCLOUD,
    maxAnswers: number = 1,
    duration?: number
  ) {
    super(roomId, subject, body, groups, format, duration);
    this.maxAnswers = maxAnswers;
  }
}
