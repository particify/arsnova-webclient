import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';


@Injectable()
export class AnnounceService {

  constructor(
    private translateService: TranslateService,
    private liveAnnouncer: LiveAnnouncer
    ) {}

    announce(key: string, args?: any) {
      this.translateService.get(key, args).subscribe(msg => {
        this.liveAnnouncer.clear();
        this.liveAnnouncer.announce(msg, 'assertive');
      });
    }
}
