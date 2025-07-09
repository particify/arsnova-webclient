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
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { UserRole } from '@app/core/models/user-roles.enum';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatDialog } from '@angular/material/dialog';
import { AnnouncementsMetaForCurrentUserGql } from '@gql/generated/graphql';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnnouncementListGqlComponent } from '@app/standalone/announcement-list-gql/announcement-list-gql.component';
import { filter, map } from 'rxjs';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-announcements-button',
  imports: [
    HotkeyDirective,
    MatTooltip,
    MatBadge,
    TranslocoPipe,
    MatIconButton,
  ],
  templateUrl: './announcements-button-gql.component.html',
})
export class AnnouncementsButtonGqlComponent {
  private dialog = inject(MatDialog);
  private announcementsMetaForCurrentUserGql = inject(
    AnnouncementsMetaForCurrentUserGql
  );
  readonly role = input<UserRole>();
  readonly auth = input<ClientAuthentication>();

  private announcementsMeta = toSignal(
    this.announcementsMetaForCurrentUserGql.fetch().pipe(
      filter((r) => !!r.data),
      map((r) => r.data.announcementsMetaForCurrentUser)
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
    const dialogRef = this.dialog.open(AnnouncementListGqlComponent, {
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
