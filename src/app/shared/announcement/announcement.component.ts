import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Announcement } from '@app/core/models/announcement';
import { UserRole } from '@app/core/models/user-roles.enum';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
})
export class AnnouncementComponent {
  @Input({ required: true }) announcement!: Announcement;
  @Input() role?: UserRole;
  @Input() roomName?: string;
  @Input() label?: string;
  @Input() editMode = false;
  @Output() deleteEvent = new EventEmitter<Announcement>();
  @Output() editEvent = new EventEmitter<Announcement>();

  markdownFeatureset = MarkdownFeatureset.SIMPLE;

  delete() {
    this.deleteEvent.emit(this.announcement);
  }

  edit() {
    this.editEvent.emit(this.announcement);
  }
}
