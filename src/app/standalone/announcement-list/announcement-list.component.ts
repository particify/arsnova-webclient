import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { UserAnnouncement } from '@app/core/models/user-announcement';
import { take } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButton } from '@angular/material/button';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnnouncementComponent } from '@app/standalone/announcement/announcement.component';
import { KeyValuePipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout';
import { AnnouncementState } from '@app/core/models/announcement-state';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.scss'],
  imports: [
    FlexModule,
    MatDialogTitle,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDivider,
    MatDialogContent,
    AnnouncementComponent,
    LoadingIndicatorComponent,
    MatDialogActions,
    MatButton,
    KeyValuePipe,
    TranslocoPipe,
  ],
})
export class AnnouncementListComponent implements OnInit {
  data: { state: AnnouncementState } = inject(MAT_DIALOG_DATA);
  private dialogRef =
    inject<MatDialogRef<AnnouncementListComponent>>(MatDialogRef);
  private authService = inject(AuthenticationService);
  private announcementService = inject(AnnouncementService);

  announcements: UserAnnouncement[] = [];
  displayAnnouncements: UserAnnouncement[] = [];
  announcementRooms = new Map<string, string>();
  selectedRoomId = '';
  newReadTimestamp = new Date();
  isLoading = true;

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
    this.dialogRef
      .beforeClosed()
      .pipe(take(1))
      .subscribe(() => this.close());
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
    if (
      !readTimestamp ||
      readTimestamp < new Date(announcement.creationTimestamp)
    ) {
      return 'new';
    } else if (readTimestamp < new Date(announcement.updateTimestamp)) {
      return 'edited';
    }
    return;
  }

  close() {
    this.dialogRef.close(this.newReadTimestamp);
  }
}
