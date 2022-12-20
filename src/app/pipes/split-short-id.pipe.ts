import { Pipe, PipeTransform } from '@angular/core';
import { NBSP, THINSP } from '../utils/html-entities';

@Pipe({ name: 'splitShortId' })
export class SplitShortIdPipe implements PipeTransform {
  transform(shortId: string, smaller = true): any {
    if (!shortId) return shortId;
    const space = smaller ? THINSP : NBSP;
    return shortId.slice(0, 4) + space + shortId.slice(4, 8);
  }
}
