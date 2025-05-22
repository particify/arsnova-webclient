import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomService } from '@app/core/services/http/room.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { QrCodeModule } from 'ng-qrcode';
import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { Room } from '@app/core/models/room';

@Component({
  selector: 'app-qr-code',
  imports: [CoreModule, QrCodeModule, ExtensionPointModule, CopyUrlComponent],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private apiConfigService = inject(ApiConfigService);
  private routingService = inject(RoutingService);
  private roomService = inject(RoomService);
  private focusModeService = inject(FocusModeService);

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setQRSize();
  }

  // Route data input below
  @Input() shortId!: string;
  @Input() room!: Room;
  @Input() showCopyUrlButton!: boolean;
  @Input() showUserCount!: boolean;
  @Input() showIcon!: boolean;

  bgColor: `#${string}`;
  fgColor: `#${string}`;
  destroyed$ = new Subject<void>();
  qrSize?: number;
  url?: string;
  qrUrl?: string;
  displayUrl?: string;
  useJoinUrl = false;
  userCount = 1;

  constructor() {
    this.bgColor = this.themeService.getColor('surface') as `#${string}`;
    this.fgColor = this.themeService.getColor('on-surface') as `#${string}`;
    this.setQRSize();
  }

  ngOnInit(): void {
    this.initQrCode();
    this.roomService
      .getRoomSummaries([this.room.id])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((summary) => {
        this.userCount = summary[0].stats.roomUserCount;
      });
    this.roomService.getCurrentRoomsMessageStream().subscribe((msg) => {
      this.userCount = JSON.parse(msg.body).UserCountChanged.userCount;
    });
    this.focusModeService.updateOverviewState();
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
