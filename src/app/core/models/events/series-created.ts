import { ContentGroup } from '@app/core/models/content-group';

export class SeriesCreated {
  type: string;
  payload: ContentGroup;

  constructor(series?: ContentGroup) {
    this.type = 'SeriesCreated';
    this.payload = series;
  }
}
