import { Component, inject, input, OnInit } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatTooltip } from '@angular/material/tooltip';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { AnnouncementState } from '@app/core/models/announcement-state';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import {
  ChangeType,
  EntityChangeNotification,
} from '@app/core/models/events/entity-change-notification';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnnouncementListComponent } from '@app/standalone/announcement-list/announcement-list.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-announcements-button',
  imports: [HotkeyDirective, MatTooltip, MatBadge, TranslocoPipe],
  templateUrl: './announcements-button.component.html',
})
export class AnnouncementsButtonComponent implements OnInit {
  private eventService = inject(EventService);
  private announcementService = inject(AnnouncementService);
  private dialog = inject(MatDialog);
  readonly role = input<UserRole>();
  readonly auth = input<ClientAuthentication>();

  announcementState?: AnnouncementState;

  ngOnInit() {
    this.eventService
      .on('EntityChangeNotification')
      .subscribe((notification) => {
        if (this.role() !== UserRole.OWNER) {
          const entityType = (notification as EntityChangeNotification).payload
            .entityType;
          const changeType = (notification as EntityChangeNotification).payload
            .changeType;
          if (
            entityType === 'Announcement' &&
            [ChangeType.CREATE, ChangeType.UPDATE].includes(changeType)
          ) {
            const userId = this.auth()?.userId;
            if (userId) {
              this.announcementService
                .getStateByUserId(userId)
                .subscribe((state) => {
                  this.announcementState = state;
                });
            } else {
              this.announcementState = undefined;
            }
          }
        }
      });
  }

  showAnnouncements() {
    const dialogRef = this.dialog.open(AnnouncementListComponent, {
      panelClass: 'dialog-margin',
      width: '90%',
      maxWidth: '872px',
      data: {
        state: this.announcementState,
      },
    });
    dialogRef.afterClosed().subscribe((newReadTimestamp) => {
      if (this.announcementState) {
        this.announcementState.readTimestamp = newReadTimestamp;
      }
    });
  }
}
