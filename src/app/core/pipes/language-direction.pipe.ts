import { Pipe, PipeTransform } from '@angular/core';

type TextDirection = 'auto' | 'ltr' | 'rtl';

/** This pipe automatically determines the text direction for a language code using the Intl API. */
@Pipe({
  name: 'languageDirection',
  standalone: true,
})
export class LanguageDirectionPipe implements PipeTransform {
  transform(language?: string): TextDirection {
    if (!language) {
      return 'auto';
    }
    // Temporary workaround: use any until getTextInfo is standardized
    // See: https://tc39.es/proposal-intl-locale-info/#sec-Intl.Locale.prototype.getTextInfo
    const locale = new Intl.Locale(language) as any;
    const textInfo =
      (locale.getTextInfo && locale.getTextInfo()) ?? locale.textInfo;
    return textInfo?.direction ?? 'auto';
  }
}
