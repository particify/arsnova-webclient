import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatTooltip } from '@angular/material/tooltip';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { AnnouncementState } from '@app/core/models/announcement-state';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { UserRole } from '@app/core/models/user-roles.enum';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { AnnouncementsMetaForCurrentUserGql } from '@gql/generated/graphql';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnnouncementListComponent } from '@app/standalone/announcement-list/announcement-list.component';
import { filter, map } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-announcements-button',
  imports: [
    HotkeyDirective,
    MatTooltip,
    MatBadge,
    TranslocoPipe,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './announcements-button.component.html',
})
export class AnnouncementsButtonComponent {
  private dialog = inject(MatDialog);
  private announcementsMetaForCurrentUserGql = inject(
    AnnouncementsMetaForCurrentUserGql
  );
  readonly role = input<UserRole>();
  readonly auth = input<AuthenticatedUser>();

  private announcementsMeta = toSignal(
    this.announcementsMetaForCurrentUserGql.fetch().pipe(
      map((r) => r.data),
      filter((data) => !!data),
      map((data) => data.announcementsMetaForCurrentUser)
    )
  );
  localAnnouncementMeta = linkedSignal(() => this.announcementsMeta());
  newAnnouncementCount = computed(
    () => this.localAnnouncementMeta()?.count ?? 0
  );

  showAnnouncements() {
    const readAt = this.localAnnouncementMeta()?.readAt;
    const state = new AnnouncementState();
    state.new = this.newAnnouncementCount();
    state.readTimestamp = readAt ? new Date(readAt) : new Date();
    const dialogRef = this.dialog.open(AnnouncementListComponent, {
      panelClass: 'dialog-margin',
      width: '90%',
      maxWidth: '872px',
      data: {
        state: state,
      },
    });
    dialogRef.afterClosed().subscribe((newReadTimestamp) => {
      this.localAnnouncementMeta.set({ readAt: newReadTimestamp, count: 0 });
    });
  }
}
