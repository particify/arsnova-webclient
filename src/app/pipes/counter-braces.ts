import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'counterBraces'})
export class CounterBraces implements PipeTransform {
  transform(count: number): string {
    if (!count) return;
    return '(' + count + ')';
  }
}
