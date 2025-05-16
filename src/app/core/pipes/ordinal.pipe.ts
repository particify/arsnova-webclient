import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'ordinal',
  standalone: true,
})
export class OrdinalPipe implements PipeTransform {
  private translateService = inject(TranslocoService);

  transform(value: number): string {
    const pluralRules = new Intl.PluralRules(
      this.translateService.getActiveLang(),
      { type: 'ordinal' }
    );
    const rule = pluralRules.select(value);
    return value + this.translateService.translate('ordinal.' + rule);
  }
}
