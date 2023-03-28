import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Announcement } from '@core/models/announcement';
import { UserRole } from '@core/models/user-roles.enum';
import { LanguageService } from '@core/services/util/language.service';
import { MarkdownFeatureset } from '@core/services/http/formatting.service';
import { TranslateService } from '@ngx-translate/core';
import { UserAnnouncement } from '@core/models/user-announcement';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
})
export class AnnouncementComponent implements OnInit {
  @Input() announcement: UserAnnouncement;
  @Input() role: UserRole;
  @Input() editMode = false;
  @Input() label: string;
  @Output() deleteEvent = new EventEmitter<Announcement>();
  @Output() editEvent = new EventEmitter<Announcement>();

  lang: string;
  markdownFeatureset = MarkdownFeatureset.SIMPLE;

  constructor(
    private langService: LanguageService,
    private translateService: TranslateService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.use(lang);
      this.lang = lang;
    });
  }

  ngOnInit(): void {
    this.lang = this.translateService.currentLang;
  }

  delete() {
    this.deleteEvent.emit(this.announcement);
  }

  edit() {
    this.editEvent.emit(this.announcement);
  }
}
