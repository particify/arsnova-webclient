import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomService } from '@app/core/services/http/room.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { QrCodeModule } from 'ng-qrcode';
import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CoreModule, QrCodeModule, ExtensionPointModule, CopyUrlComponent],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setQRSize();
  }
  shortId: string;
  roomId: string;
  passwordProtected: boolean;

  bgColor: `#${string}`;
  fgColor: `#${string}`;
  destroyed$ = new Subject<void>();
  qrSize?: number;
  url?: string;
  qrUrl?: string;
  displayUrl?: string;
  useJoinUrl = false;
  userCount = 1;
  showCopyUrlButton: boolean;
  showUserCount: boolean;
  showIcon: boolean;

  constructor(
    private themeService: ThemeService,
    private apiConfigService: ApiConfigService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    private roomService: RoomService,
    private focusModeService: FocusModeService
  ) {
    this.showCopyUrlButton = !!this.route.snapshot.data.showCopyUrlButton;
    this.showIcon = !!this.route.snapshot.data.showIcon;
    this.showUserCount = !!this.route.snapshot.data.showUserCount;
    const room = this.route.snapshot.data.room;
    this.shortId = room.shortId;
    this.roomId = room.id;
    this.passwordProtected = room.passwordProtected;
    this.bgColor = this.themeService.getColor('surface') as `#${string}`;
    this.fgColor = this.themeService.getColor('on-surface') as `#${string}`;
    this.setQRSize();
  }

  ngOnInit(): void {
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
    this.focusModeService.updateOverviewState(this.route.snapshot.data.room);
  }

  initQrCode() {
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

  setQRSize(): void {
    this.qrSize =
      Math.min(innerWidth, innerHeight) *
      (innerWidth > 600 ? (innerWidth > 1279 ? 0.45 : 0.3) : 0.8);
  }
}
