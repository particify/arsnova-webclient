import { Content } from './content';
import { ContentType } from './content-type.enum';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class ContentFlashcard extends Content {
  additionalText: string;
  renderedAdditionalText!: string;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    additionalText: string = '',
    groups: string[] = [],
    format: ContentType = ContentType.FLASHCARD
  ) {
    super(roomId, subject, body, groups, format, {});
    this.additionalText = additionalText;
  }
}
