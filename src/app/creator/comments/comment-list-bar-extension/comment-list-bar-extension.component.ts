import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-comment-list-bar-extension',
  templateUrl: './comment-list-bar-extension.component.html',
  styleUrls: [
    '../../../standalone/comment-list-bar/comment-list-bar.component.scss',
  ],
  standalone: false,
})
export class CommentListBarExtensionComponent {
  private translateService = inject(TranslocoService);
  private dialogService = inject(DialogService);
  private commentService = inject(CommentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  @Input({ required: true }) room!: Room;
  @Input() isModeration = false;
  @Input() comments: Comment[] = [];
  @Input() readonly = false;
  @Input({ required: true }) viewRole!: UserRole;

  @Output() createCommentClicked = new EventEmitter<void>();
  @Output() toggleReadonlyClicked = new EventEmitter<void>();
  @Output() resetCommentsClicked = new EventEmitter<void>();

  openDeleteCommentsDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comments',
      'creator.dialog.' +
        (this.isModeration
          ? 'really-delete-banned-comments'
          : 'really-delete-comments'),
      undefined,
      undefined,
      () =>
        this.isModeration
          ? this.commentService.deleteCommentsById(
              this.room.id,
              this.comments.map((c) => c.id)
            )
          : this.commentService.deleteCommentsByRoomId(this.room.id)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteComments();
      }
    });
  }

  deleteComments(): void {
    if (this.isModeration) {
      const msg = this.translateService.translate(
        'creator.comment-list.banned-comments-deleted'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    } else {
      const msg = this.translateService.translate(
        'creator.comment-list.all-comments-deleted'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
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

  create() {
    this.createCommentClicked.emit();
  }

  toggleReadonly() {
    this.toggleReadonlyClicked.emit();
  }
}
