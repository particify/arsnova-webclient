import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

export class Content {
  id: string;
  revision: string;
  roomId: string;
  subject: string;
  body: string;
  renderedBody: string;
  groups: string[];
  format: ContentType;
  formatAttributes: { [key: string]: string };
  abstentionsAllowed: boolean;
  state: ContentState;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    format: ContentType = ContentType.TEXT,
    formatAttributes: { [key: string]: string } = {}
  ) {
    this.roomId = roomId;
    this.subject = subject;
    this.body = body;
    this.groups = groups;
    this.format = format;
    this.formatAttributes = formatAttributes;
  }
}
