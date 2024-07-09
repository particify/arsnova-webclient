import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(milliseconds: number, contentDuration?: number): string {
    dayjs.extend(duration);
    return dayjs!
      .duration(milliseconds, 'milliseconds')
      .format('mm:ss.SSS')
      .slice(
        contentDuration && contentDuration < 60 ? 3 : 0,
        contentDuration && contentDuration > 59 ? -4 : -2
      );
  }
}
