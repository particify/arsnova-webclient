import {
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';
// The translation files sit outside src/app and no path alias points at them, so this is the one
// place allowed to reach them relatively.
/* eslint-disable no-restricted-imports */
import i18nDe from '../assets/i18n/de.json';
import i18nEn from '../assets/i18n/en.json';
/* eslint-enable no-restricted-imports */
// import i18nAdminEn from '../assets/i18n/admin/en.json';
// import i18nCreatorEn from '../assets/i18n/creator/en.json';
// import i18nParticipantEn from '../assets/i18n/participant/en.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: {
      // Uncomment the following lines to enable l10n strings for testing
      // en: i18nEn,
      // 'admin/en': i18nAdminEn,
      // 'creator/en': i18nCreatorEn,
      // 'participant/en': i18nParticipantEn,
    },
    translocoConfig: {
      availableLangs: ['en'],
      defaultLang: 'en',
    },
    preloadLangs: true,
    ...options,
  });
}

/**
 * Loads the real English and German translations of the global scope, for the rare spec whose
 * subject is a translated string rather than the key. Everything else should keep asserting on
 * keys with getTranslocoModule() instead.
 */
export function getTranslocoModuleWithTranslations() {
  return getTranslocoModule({
    langs: { de: i18nDe, en: i18nEn },
    translocoConfig: {
      availableLangs: ['de', 'en'],
      defaultLang: 'en',
    },
  });
}
