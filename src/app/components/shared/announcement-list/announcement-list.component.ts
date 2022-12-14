import { Component, Inject, OnInit } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { AnnouncementService } from '@arsnova/app/services/http/announcement.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { UserAnnouncement } from '@arsnova/app/models/user-announcement';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.scss'],
})
export class AnnouncementListComponent implements OnInit {
  announcements: UserAnnouncement[] = [];
  displayAnnouncements: UserAnnouncement[] = [];
  announcementRooms = new Map<string, string>();
  selectedRoomId = '';
  newReadTimestamp: Date;
  isLoading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AnnouncementListComponent>,
    private authService: AuthenticationService,
    private announcementService: AnnouncementService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentAuthentication().subscribe((auth) => {
      this.announcementService
        .getByUserId(auth.userId)
        .subscribe((announcements) => {
          this.announcements = announcements;
          this.announcements.forEach((a) => {
            this.announcementRooms.set(a.roomId, a.roomName);
          });
          this.displayAnnouncements = announcements;
          this.data.state.new = 0;
          this.newReadTimestamp = new Date();
          this.isLoading = false;
        });
    });
    this.dialogRef.beforeClosed().subscribe(() => this.close());
  }

  filter() {
    if (this.selectedRoomId) {
      this.displayAnnouncements = this.announcements.filter(
        (a) => a.roomId === this.selectedRoomId
      );
    } else {
      this.displayAnnouncements = this.announcements;
    }
  }

  getLabel(announcement: UserAnnouncement) {
    const readTimestamp = this.data.state.readTimestamp;
    if (!readTimestamp || readTimestamp < announcement.creationTimestamp) {
      return 'new';
    } else if (readTimestamp < announcement.updateTimestamp) {
      return 'edited';
    }
    return null;
  }

  close() {
    this.dialogRef.close(this.newReadTimestamp.toDateString());
  }
}
