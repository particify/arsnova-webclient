import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { AppComponent } from '@app/app.component';

import { AppConfig } from '@app/app.config';

bootstrapApplication(AppComponent, {
  ...AppConfig,
  providers: [provideZoneChangeDetection(), ...AppConfig.providers],
})
  .catch((e) => console.error(e))
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker.register('./ngsw-worker.js');
    }
  });
