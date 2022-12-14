import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Comment } from '../../../models/comment';
import { Vote } from '../../../models/vote';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { CommentService } from '../../../services/http/comment.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CorrectWrong } from '../../../models/correct-wrong.enum';
import { UserRole } from '../../../models/user-roles.enum';
import { DialogService } from '../../../services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { VoteService } from '../../../services/http/vote.service';
import { Observable, Subject } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CommentAnswerComponent } from '@arsnova/app/components/shared/_dialogs/comment-answer/comment-answer.component';
import { RoutingService } from '@arsnova/app/services/util/routing.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  animations: [
    trigger('slide', [
      state('hidden', style({ opacity: 0, transform: 'translateY(-10px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden <=> visible', animate(700)),
    ]),
  ],
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() comment: Comment;
  @Input() isNew: boolean;
  @Input() referenceEvent: Observable<string>;
  @Input() inAnswerView = false;
  @Input() viewRoleInput: UserRole;
  @Input() archived = false;
  @Input() isPresentation = false;
  @Output() clickedOnTag = new EventEmitter<string>();
  @Output() activeComment = new EventEmitter<Comment>();
  @Input() isModeratorView = false;
  @Input() fileUploadEnabled = false;

  viewRole: UserRole;
  isParticipant = false;
  isCreator = false;
  isModerator = false;
  hasVoted = 0;
  currentVote: string;
  language: string;
  slideAnimationState = 'hidden';
  deviceType: string;
  roleString: string;
  userId: string;
  extensionData: any;
  extensionEvent: Subject<string> = new Subject<string>();
  destroyed$ = new Subject<void>();

  constructor(
    protected authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private voteService: VoteService,
    private notification: NotificationService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected langService: LanguageService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    public dialog: MatDialog,
    private routingService: RoutingService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.use(lang);
      this.language = lang;
    });
  }

  ngOnInit() {
    if (this.viewRoleInput) {
      this.viewRole = this.viewRoleInput;
      this.getRole();
    } else {
      this.route.data.subscribe((data) => {
        this.viewRole = data.viewRole;
        this.getRole();
      });
    }
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.userId = auth.userId));
    this.language = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    this.translateService.use(this.language);
    this.deviceType = this.globalStorageService.getItem(
      STORAGE_KEYS.DEVICE_TYPE
    );
    this.extensionData = {
      roomId: this.comment.roomId,
      refId: this.comment.id,
      refType: 'comment',
      detailedView: false,
      pureImageView: true,
      retryEvent: this.extensionEvent,
    };
    if (this.referenceEvent) {
      this.referenceEvent.subscribe((id) => {
        if (this.comment.id === id) {
          this.extensionEvent.next(this.comment.id);
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getRole() {
    this.roleString = this.routingService.getRoleRoute(this.viewRole);
    switch (this.viewRole) {
      case UserRole.PARTICIPANT:
        this.isParticipant = true;
        break;
      case UserRole.CREATOR:
        this.isCreator = true;
        break;
      case UserRole.EXECUTIVE_MODERATOR:
      /* fall through */
      case UserRole.EDITING_MODERATOR:
        this.isModerator = true;
    }
  }

  changeSlideState(): void {
    this.slideAnimationState = 'visible';
  }

  resetVotingAnimation() {
    setTimeout(() => {
      this.currentVote = '';
    }, 1000);
  }

  @Input()
  set parseVote(vote: Vote) {
    if (vote) {
      this.hasVoted = vote.vote;
    }
  }

  markCorrect(type: CorrectWrong): void {
    if (this.comment.correct === type) {
      this.comment.correct = CorrectWrong.NULL;
    } else {
      this.comment.correct = type;
    }
    this.commentService
      .markCorrect(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
  }

  setFavorite(): void {
    this.commentService
      .toggleFavorite(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
  }

  vote(vote: number) {
    const voteString = vote.toString();
    let subscription;
    if (this.hasVoted !== vote) {
      if (voteString === '1') {
        subscription = this.voteService.voteUp(
          this.comment.roomId,
          this.comment.id,
          this.userId
        );
      } else {
        subscription = this.voteService.voteDown(
          this.comment.roomId,
          this.comment.id,
          this.userId
        );
      }
      this.currentVote = voteString;
      this.hasVoted = vote;
    } else {
      subscription = this.voteService.deleteVote(
        this.comment.roomId,
        this.comment.id,
        this.userId
      );
      this.hasVoted = 0;
      this.currentVote = '0';
    }
    subscription.subscribe(() => {
      this.resetVotingAnimation();
    });
  }

  openDeleteCommentDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'comment',
      'really-delete-comment'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.delete();
      }
    });
  }

  answerComment() {
    if (!this.inAnswerView) {
      this.dialog.open(CommentAnswerComponent, {
        panelClass: 'screenDialog',
        data: {
          comment: this.comment,
          role: this.viewRole,
        },
      });
    }
  }

  delete(): void {
    this.commentService.deleteComment(this.comment).subscribe(() => {
      this.translateService
        .get('comment-list.comment-deleted')
        .subscribe((msg) => {
          this.notification.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        });
    });
  }

  setAck(): void {
    this.commentService
      .toggleAck(this.comment)
      .subscribe((updatedComment) => (this.comment = updatedComment));
    this.translateService
      .get(
        this.comment.ack
          ? 'comment-page.a11y-rejected'
          : 'comment-page.a11y-banned'
      )
      .subscribe((status) => {
        this.announceService.announce('comment-page.a11y-comment-has-been', {
          status: status,
        });
      });
  }

  openPresentDialog(): void {
    if (this.isPresentation || this.isCreator) {
      this.activeComment.emit(this.comment);
    } else {
      this.answerComment();
    }
  }
}
