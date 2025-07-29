import { Component, HostListener, inject, input, output } from '@angular/core';
import { QrCodeComponent } from 'ng-qrcode';
import { Room } from '@app/core/models/room';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { ThemeService } from '@app/core/theme/theme.service';

@Component({
  selector: 'app-share-overlay',
  imports: [
    QrCodeComponent,
    FlexLayoutModule,
    SplitShortIdPipe,
    MatIcon,
    MatMiniFabButton,
    TrackInteractionDirective,
  ],
  templateUrl: './share-overlay.component.html',
  styleUrl: './share-overlay.component.scss',
})
export class ShareOverlayComponent {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setQrSize();
  }

  private apiConfigService = inject(ApiConfigService);
  private routingService = inject(RoutingService);
  private themeService = inject(ThemeService);

  shortId = input.required<string>();
  room = input.required<Room>();
  closeClicked = output();
  expandClicked = output();

  shortener = toSignal(
    this.apiConfigService
      .getApiConfig$()
      .pipe(map((c) => c.ui.links?.join?.url))
  );

  url = toSignal(
    toObservable(this.shortener).pipe(
      map((s) => this.routingService.getRoomJoinUrl(s))
    )
  );

  joinUrl = toSignal(
    toObservable(this.url).pipe(
      map((u) =>
        u
          ? this.routingService.removeProtocolFromUrl(
              this.shortener() ? u : document.baseURI.replace(/\/$/, '')
            )
          : undefined
      )
    )
  );

  qrSize?: number;

  bgColor: `#${string}`;
  fgColor: `#${string}`;

  constructor() {
    this.setQrSize();
    this.bgColor = this.themeService.getColor('surface') as `#${string}`;
    this.fgColor = this.themeService.getColor('on-surface') as `#${string}`;
  }

  setQrSize(): void {
    this.qrSize =
      innerWidth < 1920
        ? innerWidth < 1600
          ? innerWidth < 1280
            ? 180
            : 220
          : 260
        : 300;
  }
}
