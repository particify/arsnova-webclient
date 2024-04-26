import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(milliseconds: number): string {
    dayjs.extend(duration);
    return dayjs!
      .duration(milliseconds, 'milliseconds')
      .format('mm:ss:SSS')
      .slice(0, -1);
  }
}
