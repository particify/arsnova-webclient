import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
  shortId: string;
  roomId: string;
  passwordProtected: boolean;

  qrWidth: number;
  bgColor: `#${string}`;
  fgColor: `#${string}`;
  destroyed$ = new Subject<void>();
  url: string;
  qrUrl: string;
  displayUrl: string;
  useJoinUrl = false;

  constructor(
    private themeService: ThemeService,
    private apiConfigService: ApiConfigService,
    private route: ActivatedRoute,
    private routingService: RoutingService
  ) {}

  ngOnInit(): void {
    const room = this.route.snapshot.data.room;
    this.shortId = room.shortId;
    this.roomId = room.id;
    this.passwordProtected = room.passwordProtected;
    this.initQrCode();
  }

  initQrCode() {
    const minSize = Math.min(innerWidth, innerHeight);
    this.qrWidth = minSize * (innerWidth > 1279 ? 0.5 : 0.35);
    this.bgColor = this.themeService.getColor('surface') as `#${string}`;
    this.fgColor = this.themeService.getColor('on-surface') as `#${string}`;
    this.apiConfigService
      .getApiConfig$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((config) => {
        this.url = this.routingService.getRoomJoinUrl(
          config.ui.links?.join?.url
        );
        if (config.ui.links?.join) {
          this.useJoinUrl = true;
          this.displayUrl = this.url;
        } else {
          this.displayUrl = document.baseURI.replace(/\/$/, '');
        }
        this.displayUrl = this.routingService.removeProtocolFromUrl(
          this.displayUrl
        );
        this.qrUrl = this.url + '?entry=qr';
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
