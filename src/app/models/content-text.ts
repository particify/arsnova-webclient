import { Content } from './content';
import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

export class ContentText extends Content {

  constructor(id: string,
              revision: string,
              roomId: string,
              subject: string,
              body: string,
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
  }
}
