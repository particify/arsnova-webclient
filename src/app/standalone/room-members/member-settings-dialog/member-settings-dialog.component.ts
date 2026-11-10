import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { MemberInviteFormComponent } from '@app/standalone/room-members/member-invite-form/member-invite-form.component';
import { MemberListComponent } from '@app/standalone/room-members/member-list/member-list.component';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';

export interface MemberSettingsDialogData {
  roomId: string;
}

/** All members of a room's team, to invite, change roles and remove access. */
@Component({
  selector: 'app-member-settings-dialog',
  templateUrl: './member-settings-dialog.component.html',
  styleUrls: ['./member-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MemberInviteFormComponent,
    MemberListComponent,
    TranslocoPipe,
  ],
})
export class MemberSettingsDialogComponent {
  readonly data = inject<MemberSettingsDialogData>(MAT_DIALOG_DATA);
  readonly dialogId = 'member-settings';
  readonly members = toSignal(
    inject(RoomMembersService).watchMembers(this.data.roomId)
  );
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Keeps the focus in the dialog once no member is left to remove. */
  focusInviteField() {
    this.elementRef.nativeElement
      .querySelector<HTMLElement>('[data-testid="team-login-id"]')
      ?.focus();
  }
}
