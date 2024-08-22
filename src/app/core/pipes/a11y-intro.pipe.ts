import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { HELP_KEY } from '@app/core/services/util/hotkey.service';

@Pipe({ name: 'a11yIntro' })
export class A11yIntroPipe implements PipeTransform {
  constructor(private translateService: TranslocoService) {}

  transform(i18nKey: string, args?: object): Observable<string> {
    return this.translateService
      .selectTranslate([i18nKey, 'hotkeys.a11y-help-key-announcement'], {
        helpKey: HELP_KEY,
        ...args,
      })
      .pipe(
        take(1),
        map((t) => {
          return t[0] + ' ' + t[1];
        })
      );
  }
}
