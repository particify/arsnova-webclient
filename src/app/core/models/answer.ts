import { ContentType } from './content-type.enum';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Answer {
  id!: string;
  revision!: string;
  creationTimestamp!: Date;
  contentId: string;
  round: number;
  format: ContentType;
  durationMs?: number;

  constructor(contentId: string, round: number, format: ContentType) {
    this.contentId = contentId;
    this.round = round;
    this.format = format;
  }
}
