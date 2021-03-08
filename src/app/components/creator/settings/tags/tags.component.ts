import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { EventService } from '../../../../services/util/event.service';
import { FormControl, Validators } from '@angular/forms';
import { Room } from '../../../../models/room';
import { RoomService } from '../../../../services/http/room.service';
import { UpdateEvent } from '@arsnova/app/components/creator/settings/settings.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {

  @Output() saveEvent: EventEmitter<UpdateEvent> = new EventEmitter<UpdateEvent>();

  @Input() room: Room;

  tagExtension: object;
  tags: string[] = [];
  tagName = '';

  tagFormControl = new FormControl('', [Validators.minLength(3), Validators.maxLength(15)]);

  constructor(public dialog: MatDialog,
              public notificationService: NotificationService,
              public translationService: TranslateService,
              protected langService: LanguageService,
              public eventService: EventService,
              protected roomService: RoomService) {
    langService.langEmitter.subscribe(lang => translationService.use(lang));
  }

  ngOnInit() {
    if (this.room.extensions !== undefined && this.room.extensions.tags !== undefined) {
      this.tagExtension = this.room.extensions.tags;
    }
    if (!this.room.extensions) {
      this.tagExtension = {};
      this.tagExtension['enableTags'] = true;
      this.room.extensions = {};
      this.room.extensions.tags = this.tagExtension;
    } else {
      if (this.room.extensions.tags) {
        this.tags = this.room.extensions.tags['tags'] || [];
      }
    }
  }

  addTag() {
    if (this.tagFormControl.valid) {
      this.tags.push(this.tagName);
      this.tagName = '';
      this.room.extensions.tags = { enableTags: true, tags: this.tags };
      this.saveChanges(true);
    }
  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter(o => o !== tag);
    this.tagExtension['tags'] = this.tags;
    this.saveChanges(false);
  }

  saveChanges(added: boolean) {
    this.saveEvent.emit(new UpdateEvent(this.room, false));
    this.translationService.get(added ? 'settings.tag-added' : 'settings.tag-removed').subscribe(msg => {
      this.notificationService.showAdvanced(msg, added ? AdvancedSnackBarTypes.SUCCESS : AdvancedSnackBarTypes.WARNING);
    });
  }
}
