import { ContentType } from './content-type.enum';

export class Answer {
  id: string;
  revision: string;
  contentId: string;
  round: number;
  creationTimestamp: Date;
  format: ContentType;
}
