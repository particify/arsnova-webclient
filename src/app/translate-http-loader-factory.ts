import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function TranslateHttpLoaderFactory(http: HttpClient, moduleName: string) {
  return new TranslateHttpLoader(http, `../../assets/i18n/${moduleName}/`, '.json');
}
