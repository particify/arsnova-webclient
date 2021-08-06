import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { Router } from '@angular/router';
import { CommentService } from '../../../../services/http/comment.service';
import { BonusTokenService } from '../../../../services/http/bonus-token.service';
import { CommentSettingsService } from '../../../../services/http/comment-settings.service';
import { Room } from '../../../../models/room';
import { CommentSettings } from '../../../../models/comment-settings';
import { DialogService } from '../../../../services/util/dialog.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { UpdateEvent } from '../settings.component';
import { Comment } from '../../../../models/comment';
import { EventService } from '../../../../services/util/event.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export class CommentExtensions {
  enableThreshold: boolean;
  commentThreshold: number;
  enableTags: boolean;
  tags: string[];
}

@Component({
  selector: 'app-comment-settings',
  templateUrl: './comment-settings.component.html',
  styleUrls: ['./comment-settings.component.scss']
})
export class CommentSettingsComponent implements OnInit {

  @Output() saveEvent: EventEmitter<UpdateEvent> = new EventEmitter<UpdateEvent>();

  @Input() room: Room;
  @Input() roomId: string;

  commentExtension: any;
  threshold: number;
  enableThreshold = false;
  directSend = true;
  directSendDefault = true;
  enableTags = false;
  tags: string[] = [];
  timestamp = new Date();
  tagExtension: object;
  tagName = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    public dialog: MatDialog,
    public notificationService: NotificationService,
    public translationService: TranslateService,
    protected roomService: RoomService,
    public router: Router,
    public commentService: CommentService,
    public commentSettingsService: CommentSettingsService,
    private bonusTokenService: BonusTokenService,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService,
    private liveAnnouncer: LiveAnnouncer,
    public eventService: EventService
  ) {
  }

  ngOnInit() {
    if (!this.room.extensions) {
      this.room.extensions = {};
    }
    if (!this.room.extensions.comments) {
      this.room.extensions.comments = {};
    }
    this.commentExtension = this.room.extensions.comments;
    if (this.commentExtension.enableThreshold !== null) {
      this.commentExtension.commentThreshold !== undefined ?
        this.threshold = this.commentExtension.commentThreshold : this.threshold = -100;
      this.enableThreshold = this.commentExtension.enableThreshold;
    }

    this.initTags();
    this.commentSettingsService.get(this.roomId).subscribe(settings => {
      this.directSend = settings.directSend;
      this.directSendDefault = settings.directSend;
    });
  }

  initTags() {
    this.enableTags = this.commentExtension.enableTags;
    if (this.room.extensions.tags) {
      this.tagExtension = this.room.extensions.tags;
      this.tags = this.room.extensions.tags['tags'] || [];
    } else {
      this.tagExtension = { enableTags: true };
      this.room.extensions.tags = this.tagExtension;
    }
  }

  addTag() {
    if (this.tagName.length > 0) {
      if (this.checkIfTagExists()) {
        const msg = this.translationService.instant('settings.tag-error');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      } else {
        this.tags.push(this.tagName);
        this.tagName = '';
        this.room.extensions.tags = { enableTags: true, tags: this.tags };
        this.saveChanges(true);
      }
    }
  }

  checkIfTagExists(): boolean {
    return this.tags.indexOf(this.tagName.trim()) > -1;
  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter(o => o !== tag);
    this.tagExtension['tags'] = this.tags;
    this.room.extensions.tags = this.tagExtension;
    this.saveChanges(false);
  }

  onSliderChange(event: any) {
    if (event.value) {
      this.threshold = event.value;
    } else {
      this.threshold = 0;
    }
  }

  updateCommentSettings() {
    let commentExtension: CommentExtensions = new CommentExtensions();
    commentExtension.enableThreshold = this.enableThreshold;
    commentExtension.commentThreshold = this.threshold;
    commentExtension.enableTags = this.enableTags;
    commentExtension.tags = this.tags;
    this.room.extensions.comments = commentExtension;
    this.saveChanges();
  }

  updateDirectSend() {
    const commentSettings = new CommentSettings();
    commentSettings.roomId = this.roomId;
    commentSettings.directSend = this.directSend;
    this.commentSettingsService.update(commentSettings).subscribe();
  }

  saveChanges(addedTag?: boolean) {
    this.saveEvent.emit(new UpdateEvent(this.room, false));
    if (addedTag !== undefined) {
      const msg = this.translationService.instant(addedTag ? 'settings.tag-added' : 'settings.tag-removed');
      this.notificationService.showAdvanced(msg, addedTag ? AdvancedSnackBarTypes.SUCCESS : AdvancedSnackBarTypes.WARNING);
    }
  }

  announceThreshold() {
    this.translationService.get('settings.a11y-threshold-changed', { value: this.threshold }).subscribe(msg => {
      this.liveAnnouncer.clear();
      this.liveAnnouncer.announce(msg);
    });
  }
}
