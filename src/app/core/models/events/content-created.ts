import { ContentType } from '@app/core/models/content-type.enum';

export class ContentCreated {
  type: string;
  payload: {
    format: ContentType;
  };

  constructor(format: ContentType) {
    this.type = 'ContentCreated';
    this.payload = {
      format: format,
    };
  }
}
