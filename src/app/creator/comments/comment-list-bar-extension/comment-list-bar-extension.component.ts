import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Comment } from '@app/core/models/comment';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { CommentService } from '@app/core/services/http/comment.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-list-bar-extension',
  templateUrl: './comment-list-bar-extension.component.html',
  styleUrls: [
    '../../../standalone/comment-list-bar/comment-list-bar.component.scss',
  ],
})
export class CommentListBarExtensionComponent {
  @Input() room: Room;
  @Input() isModeration = false;
  @Input() comments: Comment[] = [];
  @Input() readonly = false;
  @Input() viewRole: UserRole;

  @Output() switchListClicked = new EventEmitter<number>();
  @Output() toggleReadonlyClicked = new EventEmitter<void>();
  @Output() resetCommentsClicked = new EventEmitter<void>();

  constructor(
    private translateService: TranslateService,
    private dialogService: DialogService,
    private commentService: CommentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  openDeleteCommentsDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comments',
      this.isModeration
        ? 'really-delete-banned-comments'
        : 'really-delete-comments'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteComments();
      }
    });
  }

  deleteComments(): void {
    if (this.isModeration) {
      this.commentService
        .deleteCommentsById(
          this.room.id,
          this.comments.map((c) => c.id)
        )
        .subscribe(() => {
          const msg = this.translateService.instant(
            'comment-list.banned-comments-deleted'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        });
    } else {
      this.commentService.deleteCommentsByRoomId(this.room.id).subscribe(() => {
        const msg = this.translateService.instant(
          'comment-list.all-comments-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      });
    }
  }

  onExport(): void {
    this.commentService.export(this.comments, this.room);
  }

  navToSettings() {
    this.router.navigate(['edit', this.room.shortId, 'settings', 'comments']);
  }

  resetComments() {
    this.resetCommentsClicked.emit();
  }

  switchList(index: number) {
    this.switchListClicked.emit(index);
  }

  toggleReadonly() {
    this.toggleReadonlyClicked.emit();
  }
}
