import { Injectable, isDevMode, NgModule, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Translation,
  TranslocoLoader,
  TranslocoModule,
  provideTransloco,
  provideTranslocoLoader,
} from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(langPath: string) {
    return this.http.get<Translation>(`/assets/i18n/${langPath}.json`);
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: ['en', 'de', 'es', 'fr', 'it'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLoader(TranslocoHttpLoader),
  ],
})
export class TranslocoRootModule {}
