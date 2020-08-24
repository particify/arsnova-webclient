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
import { CommentBonusTokenMixin } from '../../../../models/comment-bonus-token-mixin';
import { CommentSettings } from '../../../../models/comment-settings';
import { TSMap } from 'typescript-map';
import { DialogService } from '../../../../services/util/dialog.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';

@Component({
  selector: 'app-comment-settings',
  templateUrl: './comment-settings.component.html',
  styleUrls: ['./comment-settings.component.scss']
})
export class CommentSettingsComponent implements OnInit {

  @Output() saveEvent: EventEmitter<Room> = new EventEmitter<Room>();

  @Input() editRoom: Room;
  @Input() roomId: string;

  comments: CommentBonusTokenMixin[];
  commentExtension: any;
  threshold: number;
  enableThreshold = false;
  enableModeration = false;
  directSend = true;
  directSendDefault = true;
  enableTags = false;
  tags: string[] = [];
  timestamp = new Date();

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
    private liveAnnouncer: LiveAnnouncer
  ) {
  }

  ngOnInit() {
    if (this.editRoom.extensions && this.editRoom.extensions['comments']) {
      this.commentExtension = this.editRoom.extensions['comments'];
      if (this.commentExtension.enableThreshold !== null) {
        this.commentExtension.commentThreshold !== undefined ?
          this.threshold = this.commentExtension.commentThreshold : this.threshold = -100;
        this.enableThreshold = this.commentExtension.enableThreshold;
      }

      if (this.commentExtension.enableTags !== null) {
        this.enableTags = this.commentExtension.enableTags;
        this.tags = this.commentExtension.tags;
      }

      if (this.commentExtension.enableModeration !== null) {
        this.enableModeration = this.commentExtension.enableModeration;
      }
    }
    this.commentSettingsService.get(this.roomId).subscribe(settings => {
      this.directSend = settings.directSend;
      this.directSendDefault = settings.directSend;
    });
  }

  onSliderChange(event: any) {
    if (event.value) {
      this.threshold = event.value;
    } else {
      this.threshold = 0;
    }
  }

  openDeleteCommentsDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-comments');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteComments();
      }
    });
  }

  deleteComments(): void {
    this.translationService.get('settings.comments-deleted').subscribe(msg => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    });
    this.commentService.deleteCommentsByRoomId(this.roomId).subscribe();
  }

  export(delimiter: string): void {
    this.commentService.getAckComments(this.roomId)
      .subscribe(comments => {
        this.bonusTokenService.getTokensByRoomId(this.roomId).subscribe(list => {
          this.comments = comments.map(comment => {
            const commentWithToken: CommentBonusTokenMixin = <CommentBonusTokenMixin>comment;
            for (const bt of list) {
              if (commentWithToken.creatorId === bt.userId && comment.id === bt.commentId) {
                commentWithToken.bonusToken = bt.token;
              }
            }
            return commentWithToken;
          });
          const exportComments = JSON.parse(JSON.stringify(this.comments));
          let csv: string;
          let valueFields = '';
          const fieldNames = ['settings.question', 'settings.timestamp', 'settings.presented',
            'settings.favorite', 'settings.correct/wrong', 'settings.score'];
          let keyFields;
          this.translationService.get(fieldNames).subscribe(msgs => {
            keyFields = [msgs[fieldNames[0]], msgs[fieldNames[1]], msgs[fieldNames[2]], msgs[fieldNames[3]],
              msgs[fieldNames[4]], msgs[fieldNames[5]], '\r\n'];
            exportComments.forEach(element => {
              element.body = '"' + element.body.replace(/[\r\n]/g, ' ').replace(/ +/g, ' ').replace(/"/g, '""') + '"';
              valueFields += Object.values(element).slice(3, 4) + delimiter;
              let time;
              time = Object.values(element).slice(4, 5);
              valueFields += time[0].slice(0, 10) + '-' + time[0].slice(11, 16) + delimiter;
              valueFields += Object.values(element).slice(5, 6) + delimiter;
              valueFields += Object.values(element).slice(6, 7) + delimiter;
              valueFields += Object.values(element).slice(7, 8) + delimiter;
              valueFields += Object.values(element).slice(9, 10) + '\r\n';
            });
            const date = new Date();
            const dateString = date.toLocaleDateString();
            csv = keyFields + valueFields;
            const myBlob = new Blob([csv], { type: 'text/csv' });
            const link = document.createElement('a');
            const fileName = this.editRoom.name + '_' + this.editRoom.shortId + '_' + dateString + '.csv';
            link.setAttribute('download', fileName);
            link.href = window.URL.createObjectURL(myBlob);
            link.click();
          });
        });
      });
  }

  onExport(): void {
    this.export(',');
  }

  updateCommentSettings() {
    const commentExtension: TSMap<string, any> = new TSMap();
    commentExtension.set('enableThreshold', this.enableThreshold);
    commentExtension.set('commentThreshold', this.threshold);
    commentExtension.set('enableModeration', this.enableModeration);
    commentExtension.set('enableTags', this.enableTags);
    commentExtension.set('tags', this.tags);
    this.editRoom.extensions['comments'] = commentExtension;
    this.globalStorageService.setItem(STORAGE_KEYS.MODERATION_ENABLED, String(this.enableModeration));
    this.saveChanges();
  }

  saveChanges() {
    const commentSettings = new CommentSettings();
    commentSettings.roomId = this.roomId;
    commentSettings.directSend = this.directSend;
    this.commentSettingsService.update(commentSettings).subscribe();
    this.saveEvent.emit(this.editRoom);
  }

  announceThreshold() {
    this.translationService.get('settings.a11y-threshold-changed', { value: this.threshold }).subscribe(msg => {
      this.liveAnnouncer.clear();
      this.liveAnnouncer.announce(msg);
    });
  }
}
