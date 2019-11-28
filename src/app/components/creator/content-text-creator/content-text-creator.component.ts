import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentText } from '../../../models/content-text';
import { ContentService } from '../../../services/http/content.service';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';

@Component({
  selector: 'app-content-text-creator',
  templateUrl: './content-text-creator.component.html',
  styleUrls: ['./content-text-creator.component.scss']
})
export class ContentTextCreatorComponent implements OnInit {
  @Input() contentSub;
  @Input() contentBod;
  @Input() contentCol;
  @Output() reset = new EventEmitter<boolean>();

  roomId: string;
  content: ContentText = new ContentText(
    '1',
    '1',
    '0',
    '',
    '',
    1,
    [],
  );

  editDialogMode = false;

  constructor(private contentService: ContentService,
              private notificationService: NotificationService,
              private translationService: TranslateService,
              private roomService: RoomService) {
  }

  ngOnInit() {
    this.roomId = localStorage.getItem(`roomId`);
  }

  resetAfterSubmit() {
    this.reset.emit(true);
    this.translationService.get('content.submitted').subscribe(message => {
      this.notificationService.show(message);
    });
  }

  submitContent() {
    let contentGroup: string;
    if (this.contentCol === 'Default') {
      contentGroup = '';
    } else {
      contentGroup = this.contentCol;
    }
    this.contentService.addContent(new ContentText(
      null,
      null,
      this.roomId,
      this.contentSub,
      this.contentBod,
      1,
      [contentGroup],
    )).subscribe(content => {
      if (this.contentCol !== 'Default') {
        this.roomService.addContentToGroup(this.roomId, this.contentCol, content.id).subscribe();
      }
      this.resetAfterSubmit();
    });
  }
}
