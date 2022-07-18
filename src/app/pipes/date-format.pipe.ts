
import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  transform(date: Date, lang: string): string {
    let dateString = 'dddd, D. MMMM YYYY, ';
    let suffix = '';
    if (lang === 'en') {
      dateString += 'h:mm A';
    } else {
      dateString += 'HH:mm '
      suffix = 'Uhr'
    }
    dayjs.locale(lang);
    return dayjs(date).format(dateString) + suffix;
  }
}