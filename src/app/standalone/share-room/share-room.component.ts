import {
  Component,
  ElementRef,
  inject,
  input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { QrCodeComponent } from 'ng-qrcode';
import { of } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-share-room',
  imports: [
    FlexModule,
    MatIcon,
    MatIconButton,
    MatMenuTrigger,
    MatMenuItem,
    MatMenu,
    MatButton,
    MatTooltip,
    TranslocoPipe,
    MatInputModule,
    ClipboardModule,
    QrCodeComponent,
    MatDivider,
  ],
  templateUrl: './share-room.component.html',
  styleUrl: './share-room.component.scss',
})
export class ShareRoomComponent implements OnInit {
  @ViewChild('hiddenQr') hiddenQr!: ElementRef;

  private apiConfigService = inject(ApiConfigService);
  private localFileService = inject(LocalFileService);
  private routingService = inject(RoutingService);
  readonly roomName = input.required<string>();
  readonly disabled = input<boolean>();
  readonly useMenuButton = input<boolean>(false);

  linkCopiedTimer?: ReturnType<typeof setTimeout>;
  linkCopied = false;
  roomJoinUrl?: string;
  showHiddenQR = false;
  roomQrBlob?: Blob;

  ngOnInit() {
    this.apiConfigService.getApiConfig$().subscribe((config) => {
      this.roomJoinUrl = this.routingService.getRoomJoinUrl(
        config.ui.links?.join?.url
      );
    });
  }

  copyRoomJoinLink() {
    this.linkCopied = true;
    this.linkCopiedTimer = setTimeout(() => {
      this.linkCopied = false;
    }, 3000);
  }

  prepareQrBlob() {
    this.showHiddenQR = true;
    setTimeout(() => {
      const canvas: HTMLCanvasElement | null =
        this.hiddenQr?.nativeElement.querySelector('canvas');
      if (!canvas) {
        return;
      }
      canvas.toBlob((blob) => {
        if (blob) {
          this.roomQrBlob = new Blob([blob], { type: 'image/png' });
        }
      }, 'image/png');
      this.showHiddenQR = false;
    });
  }

  downloadRoomJoinQr() {
    if (this.roomQrBlob) {
      this.localFileService.download(
        of(this.roomQrBlob),
        this.roomName() + `.png`
      );
    }
  }

  presentQrCode() {
    this.routingService.navToPresentation(false, true);
  }
}
