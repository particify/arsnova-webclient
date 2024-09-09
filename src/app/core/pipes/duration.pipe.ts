import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(milliseconds: number, contentDuration?: number): string {
    dayjs.extend(duration);
    return !contentDuration || contentDuration > 60
      ? dayjs!.duration(milliseconds, 'milliseconds').format('m:ss')
      : dayjs!
          .duration(milliseconds, 'milliseconds')
          .format('s.SSS')
          .slice(0, -2);
  }
}
