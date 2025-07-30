import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/it';
import localizedFormat from 'dayjs/plugin/localizedFormat';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  transform(date: Date, lang: string): string {
    dayjs.locale(lang);
    dayjs.extend(localizedFormat);
    return dayjs(date).format('LLLL');
  }
}
