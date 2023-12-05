import { ContentType } from './content-type.enum';
import { ContentState } from './content-state';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Content {
  id!: string;
  revision!: string;
  roomId: string;
  subject: string;
  body: string;
  renderedBody!: string;
  groups: string[];
  format: ContentType;
  formatAttributes: { [key: string]: string };
  abstentionsAllowed = true;
  state!: ContentState;

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
