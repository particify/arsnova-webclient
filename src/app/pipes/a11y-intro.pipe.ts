import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HELP_KEY } from '../services/util/hotkey.service';

@Pipe({ name: 'a11yIntro' })
export class A11yIntroPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(i18nKey: string, args?: object): Observable<string> {
    return this.translateService
      .get([i18nKey, 'hotkeys.a11y-help-key-announcement'], {
        helpKey: HELP_KEY,
        ...args,
      })
      .pipe(
        map((t) => {
          return t[i18nKey] + ' ' + t['hotkeys.a11y-help-key-announcement'];
        })
      );
  }
}
