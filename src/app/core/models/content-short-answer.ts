import { Content } from './content';
import { ContentType } from './content-type.enum';

export class ContentShortAnswer extends Content {
  correctTerms: string[];

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    correctTerms: string[] = [],
    format: ContentType = ContentType.SHORT_ANSWER,
    duration?: number
  ) {
    super(roomId, subject, body, groups, format, duration);
    this.correctTerms = correctTerms;
  }
}
