import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  inject,
  input,
} from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { QrCodeModule } from 'ng-qrcode';
import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { Room } from '@app/core/models/room';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RoomStatsByIdGql } from '@gql/generated/graphql';

@Component({
  selector: 'app-qr-code',
  imports: [CoreModule, QrCodeModule, ExtensionPointModule, CopyUrlComponent],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly apiConfigService = inject(ApiConfigService);
  private readonly routingService = inject(RoutingService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly roomStatsByIdGql = inject(RoomStatsByIdGql);

  @HostListener('window:resize')
  onResize() {
    this.setQRSize();
  }

  // Route data input below
  readonly roomId = input.required<string>();
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
  userCount = toSignal(
    toObservable(this.roomId).pipe(
      switchMap(
        (id) => this.roomStatsByIdGql.watch({ variables: { id } }).valueChanges
      ),
      map((s) => s.data?.roomById?.stats?.activeMemberCount)
    )
  );

  constructor() {
    this.bgColor = this.themeService.getColor('surface') as `#${string}`;
    this.fgColor = this.themeService.getColor('on-surface') as `#${string}`;
    this.setQRSize();
  }

  ngOnInit(): void {
    this.initQrCode();
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
