import { Pipe, PipeTransform } from '@angular/core';
import { NAMED_ENTITIES } from '@angular/compiler';

@Pipe({name: 'splitShortId'})
export class SplitShortId implements PipeTransform {
  transform(shortId: string, smaller = true): any {
    if (!shortId) return shortId;
    const space = smaller ? NAMED_ENTITIES['thinsp'] : NAMED_ENTITIES['nbsp'];
    return shortId.slice(0, 4) + space + shortId.slice(4, 8);
  }
}
