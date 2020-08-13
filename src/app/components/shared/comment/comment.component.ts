import { Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../../../models/comment';
import { Vote } from '../../../models/vote';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommentService } from '../../../services/http/comment.service';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CorrectWrong } from '../../../models/correct-wrong.enum';
import { UserRole } from '../../../models/user-roles.enum';
import { DialogService } from '../../../services/util/dialog.service';
import * as moment from 'moment';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { VoteService } from '../../../services/http/vote.service';

@Pipe({ name: 'dateFromNow' })
export class DateFromNow implements PipeTransform {
  transform(date: Date, lang: string): string {
    moment.locale(lang);
    return moment(date).fromNow();
  }
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  animations: [
    trigger('slide', [
      state('hidden', style({ opacity: 0, transform: 'translateY(-10px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden <=> visible', animate(700))
    ])
  ]
})

export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  @Output() clickedOnTag = new EventEmitter<string>();
  viewRole: UserRole;
  isParticipant = false;
  isCreator = false;
  isModerator = false;
  hasVoted = 0;
  currentVote: string;
  language: string;
  slideAnimationState = 'hidden';
  deviceType: string;
  inAnswerView = false;
  roleString: string;

  constructor(
    protected authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    protected router: Router,
    private location: Location,
    private commentService: CommentService,
    private voteService: VoteService,
    private notification: NotificationService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected langService: LanguageService,
    private wsCommentService: WsCommentServiceService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => {
      translateService.use(lang);
      this.language = lang;
    });
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.viewRole = data.viewRole;
      switch (this.viewRole) {
        case UserRole.PARTICIPANT:
          this.isParticipant = true;
          this.roleString = 'participant';
          break;
        case UserRole.CREATOR:
          this.isCreator = true;
          this.roleString = 'creator';
          break;
        case UserRole.EXECUTIVE_MODERATOR:
        /* fall through */
        case UserRole.EDITING_MODERATOR:
          this.isModerator = true;
          this.roleString = 'moderator';
      }
    });
    this.language = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    this.translateService.use(this.language);
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    this.inAnswerView = !this.router.url.includes('comments');
  }

  changeSlideState(): void {
    this.slideAnimationState = 'visible';
  }

  resetVotingAnimation() {
    setTimeout(() => {
        this.currentVote = '';
      },
      1000);
  }

  @Input()
  set parseVote(vote: Vote) {
    if (vote) {
      this.hasVoted = vote.vote;
    }
  }

  setRead(comment: Comment): void {
    this.comment = this.commentService.toggleRead(comment);
  }

  markCorrect(comment: Comment, type: CorrectWrong): void {
    if (comment.correct === type) {
      comment.correct = CorrectWrong.NULL;
    } else {
      comment.correct = type;
    }
    this.comment = this.commentService.markCorrect(comment);
  }

  setFavorite(comment: Comment): void {
    this.comment = this.commentService.toggleFavorite(comment);
  }

  vote(vote: number) {
    const voteString = vote.toString();
    const userId = this.authenticationService.getUser().id;
    let subscription;
    if (this.hasVoted !== vote) {
      if (voteString === '1') {
        subscription = this.voteService.voteUp(this.comment.id, userId);
      } else {
        subscription = this.voteService.voteDown(this.comment.id, userId);
      }
      this.currentVote = voteString;
      this.hasVoted = vote;
    } else {
      subscription = this.voteService.deleteVote(this.comment.id, userId);
      this.hasVoted = 0;
      this.currentVote = '0';
    }
    subscription.subscribe(() => {
      this.resetVotingAnimation();
    });
  }

  openDeleteCommentDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-comment');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.delete();
      }
    });
  }

  answerComment() {
    let url: string;
    this.route.params.subscribe(params => {
      url = `${this.roleString}/room/${params['shortId']}/comment/${this.comment.id}`;
    });
    this.router.navigate([url]);
  }

  delete(): void {
    this.commentService.deleteComment(this.comment).subscribe(room => {
      this.translateService.get('comment-list.comment-deleted').subscribe(msg => {
        this.notification.show(msg);
      });
    });
  }

  setAck(comment: Comment): void {
    this.comment = this.commentService.toggleAck(comment);
    this.translateService.get(comment.ack ? 'comment-page.a11y-rejected' : 'comment-page.a11y-banned').subscribe(status => {
      this.announceService.announce('comment-page.a11y-comment-has-been', { status: status });
    });
  }

  openPresentDialog(comment: Comment): void {
    if (this.isCreator) {
      this.wsCommentService.highlight(comment);
      if (!comment.read) {
        this.setRead(comment);
      }
    }
    const dialogRef = this.dialogService.openCommentPresentationDialog(comment.body);
    dialogRef.afterClosed()
      .subscribe(result => {
        this.wsCommentService.lowlight(comment);
      });
  }
}
