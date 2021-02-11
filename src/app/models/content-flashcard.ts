import { Content } from './content';
import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

export class ContentFlashcard extends Content {

  additionalText: string;
  renderedAdditionalText: string;

  constructor(id: string,
              revision: string,
              roomId: string,
              subject: string,
              body: string,
              additionalText: string,
              groups: string[],
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
    this.additionalText = additionalText;
  }
}
