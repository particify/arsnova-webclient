import { ContentType } from '@app/core/models/content-type.enum';
import { Answer } from './answer';

export class ShortAnswerAnswer extends Answer {
  text?: string;

  constructor(contentId: string, round: number, text?: string) {
    super(contentId, round, ContentType.SHORT_ANSWER);
    if (text) {
      this.text = text;
    }
  }
}
