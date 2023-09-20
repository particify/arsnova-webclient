import { Content } from '@app/core/models/content';

export interface ContentForm {
  getContent(): undefined | Content;
}
