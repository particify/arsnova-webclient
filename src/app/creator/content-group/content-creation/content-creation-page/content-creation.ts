import { Content } from '@app/core/models/content';

export interface ContentCreation {
  getContent(): undefined | Content;
}
