import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentText } from '../../../models/content-text';
import { ContentService } from '../../../services/http/content.service';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';
import { ContentCreatePageComponent } from '../content-create-page/content-create-page.component';

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
    [],
    null
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
    if (this.contentBod === '' || this.contentSub === '') {
      this.translationService.get('content.no-empty').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    this.contentService.addContent(new ContentText(
      null,
      null,
      this.roomId,
      this.contentSub,
      this.contentBod,
      [],
      null
    )).subscribe(content => {
      if (this.contentCol !== '') {
        this.roomService.addContentToGroup(this.roomId, this.contentCol, content.id).subscribe();
      }
      ContentCreatePageComponent.saveGroupInSessionStorage(this.contentCol);
      this.resetAfterSubmit();
      document.getElementById('subject-input').focus();
    });
  }
}
