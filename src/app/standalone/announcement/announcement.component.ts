import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Announcement } from '@app/core/models/announcement';
import { UserRole } from '@app/core/models/user-roles.enum';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { TranslocoPipe } from '@ngneat/transloco';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { DateComponent } from '@app/standalone/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { NgClass } from '@angular/common';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    NgClass,
    FlexModule,
    MatIconButton,
    MatMenuTrigger,
    MatTooltip,
    MatIcon,
    MatMenu,
    MatMenuItem,
    DateComponent,
    RenderedTextComponent,
    TranslocoPipe,
  ],
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
