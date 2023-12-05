import { ContentType } from '@app/core/models/content-type.enum';
import { Answer } from './answer';

export class TextAnswer extends Answer {
  body?: string;

  constructor(contentId: string, round: number, body?: string) {
    super(contentId, round, ContentType.TEXT);
    if (body) {
      this.body = body;
    }
  }
}
