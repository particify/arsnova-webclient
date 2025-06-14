import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({ name: 'localizeDecimalSeperator' })
export class LocalizeDecimalSeperatorPipe implements PipeTransform {
  private translateService = inject(TranslocoService);

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
