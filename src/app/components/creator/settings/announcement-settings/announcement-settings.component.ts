import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Room } from '@arsnova/app/models/room';
import { Announcement } from '@arsnova/app/models/announcement';
import { MarkdownFeatureset } from '@arsnova/app/services/http/formatting.service';
import { TranslateService } from '@ngx-translate/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@arsnova/app/services/util/notification.service';
import { AnnouncementService } from '@arsnova/app/services/http/announcement.service';
import { MatLegacyTabGroup as MatTabGroup } from '@angular/material/legacy-tabs';
import { DialogService } from '@arsnova/app/services/util/dialog.service';

@Component({
  selector: 'app-announcement-settings',
  templateUrl: './announcement-settings.component.html',
  styleUrls: ['./announcement-settings.component.scss'],
})
export class AnnouncementSettingsComponent implements OnInit {
  @ViewChild('inputTabs') inputTabs: MatTabGroup;
  @ViewChild('titleInput') titleInput: ElementRef;

  @Input() room: Room;

  title: string;
  body: string;
  announcements: Announcement[] = [];

  editId: string;
  renderPreview = false;
  markdownFeatureset = MarkdownFeatureset.SIMPLE;
  isLoading = true;

  constructor(
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private announcementService: AnnouncementService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.announcementService
      .getByRoomId(this.room.id)
      .subscribe((announcements) => {
        this.announcements = announcements.sort((a, b) => {
          return (
            new Date(b.creationTimestamp).getTime() -
            new Date(a.creationTimestamp).getTime()
          );
        });
        this.isLoading = false;
      });
  }

  delete(announcement: Announcement) {
    const dialogRef = this.dialogService.openDeleteDialog(
      'announcement',
      'really-delete-announcement',
      announcement.title
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'abort') {
        return;
      } else if (result === 'delete') {
        this.announcementService
          .delete(this.room.id, announcement.id)
          .subscribe(() => {
            const msg = this.translateService.instant('announcement.deleted');
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
            this.announcements = this.announcements.filter(
              (n) => n.id !== announcement.id
            );
          });
      }
    });
  }

  tabChanged(event) {
    this.renderPreview = event.index === 1;
  }

  save() {
    if (!this.title || !this.body) {
      const msg = this.translateService.instant('announcement.missing-input');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    if (this.editId) {
      this.announcementService
        .update(this.room.id, this.editId, this.title, this.body)
        .subscribe((announcement) => {
          const index = this.announcements
            .map((a) => a.id)
            .indexOf(announcement.id);
          this.announcements[index] = announcement;
          const msg = this.translateService.instant(
            'announcement.changes-saved'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.reset();
        });
    } else {
      this.announcementService
        .add(this.room.id, this.title, this.body)
        .subscribe((announcement) => {
          this.announcements.unshift(announcement);
          const msg = this.translateService.instant('announcement.created');
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.reset();
        });
    }
  }

  edit(announcement: Announcement) {
    if (!this.title && !this.body) {
      this.editId = announcement.id;
      this.title = announcement.title;
      this.body = announcement.body;
      this.titleInput.nativeElement.focus();
    } else {
      const dialogRef = this.dialogService.openDeleteDialog(
        'announcement',
        'really-discard-announcement',
        null,
        'discard'
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'abort') {
          return;
        } else if (result === 'discard') {
          this.resetInputs();
          this.edit(announcement);
        }
      });
    }
  }

  reset() {
    this.editId = null;
    this.inputTabs.selectedIndex = 0;
    this.renderPreview = false;
    this.resetInputs();
  }

  resetInputs() {
    this.title = '';
    this.body = '';
  }
}
