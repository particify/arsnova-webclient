import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import 'dayjs/locale/de';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  transform(date: Date, lang: string): string {
    dayjs.locale(lang);
    dayjs.extend(localizedFormat)
    return dayjs(date).format('LLLL');
  }
}