import { Content } from './content';
import { ContentType } from './content-type.enum';

export class ContentNumeric extends Content {
  minNumber: number;
  maxNumber: number;
  tolerance: number;
  correctNumber?: number;

  constructor(
    roomId: string = '',
    subject: string = '',
    body: string = '',
    groups: string[] = [],
    format: ContentType = ContentType.NUMERIC,
    minNumber: number = 0,
    maxNumber: number = 100,
    tolerance: number = 0,
    correctNumber?: number,
    duration?: number
  ) {
    super(roomId, subject, body, groups, format, duration);
    this.minNumber = minNumber;
    this.maxNumber = maxNumber;
    this.tolerance = tolerance;
    this.correctNumber = correctNumber;
  }
}
