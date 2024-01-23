import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Pipe({ name: 'localizeDecimalSeperator' })
export class LocalizeDecimalSeperatorPipe implements PipeTransform {
  constructor(private translateService: TranslocoService) {}

  transform(value: number): string {
    const fixedValue = parseFloat(value.toFixed(2)).toString();
    if (value % 1 === 0) {
      return fixedValue;
    }
    const numberEnd = Number(fixedValue.slice(-3));
    const localizedEnd = numberEnd.toLocaleString(
      this.translateService.getActiveLang()
    );
    return fixedValue.slice(0, -3) + localizedEnd.slice(-3);
  }
}
