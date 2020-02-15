import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

export class Content {
  id: string;
  revision: string;
  roomId: string;
  subject: string;
  body: string;
  groups: string[];
  format: ContentType;
  formatAttributes: Map<string, string>;
  state: ContentState;

  constructor(id: string,
              revision: string,
              roomId: string,
              subject: string,
              body: string,
              groups: string[],
              format: ContentType,
              formatAttributes: Map<string, string>,
              state: ContentState) {
    this.id = id;
    this.revision = revision;
    this.roomId = roomId;
    this.subject = subject;
    this.body = body;
    this.groups = groups;
    this.format = format;
    this.formatAttributes = formatAttributes;
    this.state = state;
  }
}
