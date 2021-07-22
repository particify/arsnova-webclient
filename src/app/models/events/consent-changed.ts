import { ConsentSettings, CookieCategory } from '../../services/util/consent.service';

export interface ConsentChangedEventPayload {
  categoriesSettings: CookieCategory[];
  consentSettings?: ConsentSettings;
}

export class ConsentChangedEvent {
  type = 'ConsentChangedEvent';
  payload: ConsentChangedEventPayload

  constructor(categoriesSettings: CookieCategory[], consentSettings?: ConsentSettings) {
    this.payload = {
      categoriesSettings: categoriesSettings,
      consentSettings: consentSettings
    }
  }
}
  