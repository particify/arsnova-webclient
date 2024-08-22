import {
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';
// import i18nEn from '../assets/i18n/en.json';
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
