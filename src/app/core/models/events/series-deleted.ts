import { ContentGroup } from '@app/core/models/content-group';

export class SeriesDeleted {
  type: string;
  payload?: ContentGroup;

  constructor(series?: ContentGroup) {
    this.type = 'SeriesDeleted';
    this.payload = series;
  }
}
