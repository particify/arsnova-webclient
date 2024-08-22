import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'ordinal',
  standalone: true,
})
export class OrdinalPipe implements PipeTransform {
  constructor(private translateService: TranslocoService) {}

  transform(value: number): string {
    const pluralRules = new Intl.PluralRules(
      this.translateService.getActiveLang(),
      { type: 'ordinal' }
    );
    const rule = pluralRules.select(value);
    return value + this.translateService.translate('ordinal.' + rule);
  }
}
