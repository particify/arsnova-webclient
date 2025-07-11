import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnnounceService {
  private translateService = inject(TranslocoService);
  private liveAnnouncer = inject(LiveAnnouncer);

  announce(key: string, args?: object) {
    this.translateService
      .selectTranslate(key, args)
      .pipe(take(1))
      .subscribe((msg) => {
        this.liveAnnouncer.clear();
        this.liveAnnouncer.announce(msg, 'assertive');
      });
  }
}
