import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/it';
@Pipe({ name: 'dateFromNow' })
export class DateFromNowPipe implements PipeTransform {
  /* The refresh parameter is not used but forces rerendering when changed. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(date: Date, lang: string, refresh?: number): string {
    dayjs.extend(relativeTime);
    dayjs.locale(lang);
    return dayjs(date).fromNow();
  }
}
