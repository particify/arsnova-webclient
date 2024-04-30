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
  abstentionsAllowed = true;
  state!: ContentState;
  duration?: number;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    format: ContentType = ContentType.TEXT,
    duration?: number
  ) {
    this.roomId = roomId;
    this.subject = subject;
    this.body = body;
    this.groups = groups;
    this.format = format;
    this.duration = duration;
  }
}
