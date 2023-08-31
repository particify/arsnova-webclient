import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable()
export class AnnounceService {
  constructor(
    private translateService: TranslocoService,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  announce(key: string, args?: object) {
    this.translateService.selectTranslate(key, args).subscribe((msg) => {
      this.liveAnnouncer.clear();
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }
}
