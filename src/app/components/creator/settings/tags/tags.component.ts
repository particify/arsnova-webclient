import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { EventService } from '../../../../services/util/event.service';
import { FormControl, Validators } from '@angular/forms';
import { Room } from '../../../../models/room';
import { RoomService } from '../../../../services/http/room.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {

  @Input() room: Room;

  extension: {};
  tags: string[];
  tagsEnabled: boolean;
  tagName: string;

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
    if (this.room.extensions !== undefined && this.room.extensions['tags'] !== undefined) {
      this.extension = this.room.extensions['tags'];
    }
    if (!this.extension) {
      this.extension = {};
      this.extension['enableTags'] = true;
      this.tags = [];
      this.tagsEnabled = true;
    } else {
      if (this.extension['tags']) {
        this.tags = this.extension['tags'];
      } else {
        this.tags = [];
      }
      this.tagsEnabled = this.extension['enableTags'];
    }
  }

  addTag() {
    if (this.tagFormControl.valid) {
      this.tags.push(this.tagName);
      this.extension['tags'] = this.tags;
      this.tagName = '';
      this.room.extensions['tags'] = this.extension;
      this.saveChanges();
    }
  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter(o => o !== tag);
    this.extension['tags'] = this.tags;
  }

  saveChanges() {
    this.roomService.updateRoom(this.room)
      .subscribe((room) => {
        this.room = room;
        this.translationService.get('settings.changes-successful').subscribe(msg => {
          this.notificationService.show(msg);
        });
      });
  }
}
