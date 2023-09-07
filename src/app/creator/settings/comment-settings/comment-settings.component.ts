import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { RoomService } from '@app/core/services/http/room.service';
import { Router } from '@angular/router';
import { CommentService } from '@app/core/services/http/comment.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { Room } from '@app/core/models/room';
import { CommentSettings } from '@app/core/models/comment-settings';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EventService } from '@app/core/services/util/event.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UpdateEvent } from '@app/creator/settings-page/settings-page.component';
import { CommentExtensions } from '@app/core/models/room-extensions';
import { take } from 'rxjs';

@Component({
  selector: 'app-comment-settings',
  templateUrl: './comment-settings.component.html',
  styleUrls: ['./comment-settings.component.scss'],
})
export class CommentSettingsComponent implements OnInit {
  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input() room: Room;
  @Input() roomId: string;

  commentExtension: CommentExtensions;
  threshold = -50;
  enableThreshold = false;
  enableTags = false;
  settings: CommentSettings;
  tags: string[] = [];
  timestamp = new Date();
  tagName = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  isLoading = true;

  constructor(
    public dialog: MatDialog,
    public notificationService: NotificationService,
    public translationService: TranslocoService,
    protected roomService: RoomService,
    public router: Router,
    public commentService: CommentService,
    public commentSettingsService: CommentSettingsService,
    private liveAnnouncer: LiveAnnouncer,
    public eventService: EventService
  ) {}

  ngOnInit() {
    if (!this.room.extensions) {
      this.room.extensions = {};
    }
    if (!this.room.extensions.comments) {
      this.room.extensions.comments = {};
    }
    this.commentExtension = this.room.extensions.comments as CommentExtensions;
    this.threshold = this.commentExtension.commentThreshold ?? this.threshold;
    this.enableThreshold =
      this.commentExtension.enableThreshold ?? this.enableThreshold;

    this.initTags();
    this.commentSettingsService.get(this.roomId).subscribe((settings) => {
      this.settings = settings;
      this.isLoading = false;
    });
  }

  initTags() {
    this.enableTags = this.commentExtension.enableTags ?? this.enableTags;
    if (this.room.extensions?.comments?.tags) {
      this.tags = this.room.extensions.comments.tags || [];
    }
  }

  addTag() {
    if (this.tagName.length > 0) {
      if (this.checkIfTagExists()) {
        const msg = this.translationService.translate(
          'creator.settings.tag-error'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      } else {
        this.tags.push(this.tagName);
        this.tagName = '';
        this.setTags();
        this.saveChanges(true);
      }
    }
  }

  checkIfTagExists(): boolean {
    return this.tags.indexOf(this.tagName.trim()) > -1;
  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter((o) => o !== tag);
    this.setTags();
    this.saveChanges(false);
  }

  setTags() {
    if (this.room.extensions?.comments) {
      this.room.extensions.comments.tags = this.tags;
    }
  }

  updateCommentExtensions(enableTreshold?: boolean) {
    this.enableThreshold = enableTreshold ?? this.enableThreshold;
    const commentExtension: CommentExtensions = {
      enableThreshold: this.enableThreshold,
      commentThreshold: this.threshold,
      enableTags: this.enableTags,
      tags: this.tags,
    };
    if (this.room.extensions) {
      this.room.extensions.comments = commentExtension;
    }
    this.saveChanges();
  }

  updateCommentSettings(change: Partial<CommentSettings> = {}) {
    const commentSettings = new CommentSettings(
      this.roomId,
      change.directSend ?? this.settings.directSend,
      this.settings.fileUploadEnabled,
      change.disabled ?? this.settings.disabled,
      this.settings.readonly
    );
    this.commentSettingsService
      .update(commentSettings)
      .subscribe((settings) => {
        this.settings = settings;
      });
  }

  updateFileUploadEnabled(fileUploadEnabled: boolean) {
    this.settings.fileUploadEnabled = fileUploadEnabled;
    this.updateCommentSettings();
  }

  saveChanges(addedTag?: boolean) {
    this.saveEvent.emit(new UpdateEvent(this.room, false));
    if (addedTag !== undefined) {
      const msg = this.translationService.translate(
        addedTag ? 'creator.settings.tag-added' : 'creator.settings.tag-removed'
      );
      this.notificationService.showAdvanced(
        msg,
        addedTag ? AdvancedSnackBarTypes.SUCCESS : AdvancedSnackBarTypes.WARNING
      );
    }
  }

  announceThreshold() {
    this.translationService
      .selectTranslate('creator.settings.a11y-threshold-changed', {
        value: this.threshold,
      })
      .pipe(take(1))
      .subscribe((msg) => {
        this.liveAnnouncer.clear();
        this.liveAnnouncer.announce(msg);
      });
  }
}
