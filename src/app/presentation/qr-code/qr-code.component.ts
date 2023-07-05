import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomService } from '@app/core/services/http/room.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
  shortId: string;
  roomId: string;
  passwordProtected: boolean;

  qrSize: number;
  bgColor: `#${string}`;
  fgColor: `#${string}`;
  destroyed$ = new Subject<void>();
  url: string;
  qrUrl: string;
  displayUrl: string;
  useJoinUrl = false;
  userCount: number;

  constructor(
    private themeService: ThemeService,
    private apiConfigService: ApiConfigService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    const room = this.route.snapshot.data.room;
    this.shortId = room.shortId;
    this.roomId = room.id;
    this.passwordProtected = room.passwordProtected;
    this.initQrCode();
    this.roomService
      .getRoomSummaries([this.roomId])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((summary) => {
        this.userCount = summary[0].stats.roomUserCount;
      });
    this.roomService.getCurrentRoomsMessageStream().subscribe((msg) => {
      this.userCount = JSON.parse(msg.body).UserCountChanged.userCount;
    });
  }

  initQrCode() {
    const minSize = Math.min(innerWidth, innerHeight);
    this.qrSize = minSize * (innerWidth > 1279 ? 0.45 : 0.3);
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
