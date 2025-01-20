import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'counterBraces',
  standalone: false,
})
export class CounterBracesPipe implements PipeTransform {
  transform(count: number): string | undefined {
    if (!count) return;
    return '(' + count + ')';
  }
}
