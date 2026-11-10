import {
  Component,
  ElementRef,
  inject,
  input,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import {
  DIALOG_SIZES,
  DialogService,
} from '@app/core/services/util/dialog.service';
import { MemberListComponent } from '@app/standalone/room-members/member-list/member-list.component';
import { MemberSettingsDialogComponent } from '@app/standalone/room-members/member-settings-dialog/member-settings-dialog.component';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
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
import { of, switchMap } from 'rxjs';
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
    MatTab,
    MatTabContent,
    MatTabGroup,
    NgTemplateOutlet,
    MemberListComponent,
  ],
  templateUrl: './share-room.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  readonly roomId = input.required<string>();
  /** Only the owner manages the team. */
  readonly isOwner = input(false);

  private readonly dialogService = inject(DialogService);
  private readonly roomMembersService = inject(RoomMembersService);
  private readonly menuTrigger = viewChild(MatMenuTrigger);
  readonly memberLimit = 3;
  readonly selectedTab = signal(0);
  private readonly teamRoomId = computed(() =>
    this.selectedTab() === 1 ? this.roomId() : undefined
  );
  readonly members = toSignal(
    toObservable(this.teamRoomId).pipe(
      switchMap((roomId) =>
        roomId ? this.roomMembersService.watchMembers(roomId) : of(undefined)
      )
    )
  );

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

  /** The menu would otherwise close on Tab and lose its keyboard users. */
  keepMenuOpen(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      event.stopPropagation();
    }
  }

  openMemberSettings() {
    this.menuTrigger()?.closeMenu();
    this.dialogService.openDialog(MemberSettingsDialogComponent, {
      width: DIALOG_SIZES.medium,
      maxWidth: '90vw',
      data: { roomId: this.roomId() },
    });
  }

  presentQrCode() {
    this.routingService.navToPresentation(false, true);
  }
}
