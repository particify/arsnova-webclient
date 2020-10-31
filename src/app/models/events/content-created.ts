import { ContentType } from '../content-type.enum';

export class ContentCreated {
  type: string;
  payload: {
    format: ContentType
  };

  constructor(format: ContentType) {
    this.type = 'ContentCreated';
    this.payload = {
      format: format
    };
  }
}
