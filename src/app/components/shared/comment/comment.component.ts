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
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

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
  @Input() userRole: UserRole;
  @Output()
  clickedOnTag = new EventEmitter<string>();
  isStudent = false;
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
    switch (this.userRole) {
      case UserRole.PARTICIPANT.valueOf():
        this.isStudent = true;
        this.roleString = 'participant';
        break;
      case UserRole.CREATOR.valueOf():
        this.isCreator = true;
        this.roleString = 'creator';
        break;
      case UserRole.EXECUTIVE_MODERATOR.valueOf():
        this.isModerator = true;
        this.roleString = 'moderator';
    }
    this.language = this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE);
    this.translateService.use(this.language);
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
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
    this.comment = this.wsCommentService.toggleRead(comment);
  }

  markCorrect(comment: Comment, type: CorrectWrong): void {
    if (comment.correct === type) {
      comment.correct = CorrectWrong.NULL;
    } else {
      comment.correct = type;
    }
    this.comment = this.wsCommentService.markCorrect(comment);
  }

  setFavorite(comment: Comment): void {
    this.comment = this.wsCommentService.toggleFavorite(comment);
  }

  vote(vote: number) {
    const voteString = vote.toString();
    const userId = this.authenticationService.getUser().id;
    if (this.hasVoted !== vote) {
      if (voteString === '1') {
        this.wsCommentService.voteUp(this.comment, userId);
      } else {
        this.wsCommentService.voteDown(this.comment, userId);
      }
      this.currentVote = voteString;
      this.hasVoted = vote;
    } else {
      this.wsCommentService.resetVote(this.comment, userId);
      this.hasVoted = 0;
      this.currentVote = '0';
    }
    this.resetVotingAnimation();
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
    this.commentService.deleteComment(this.comment.id).subscribe(room => {
      this.translateService.get('comment-list.comment-deleted').subscribe(msg => {
        this.notification.show(msg);
      });
    });
  }

  setAck(comment: Comment): void {
    this.comment = this.wsCommentService.toggleAck(comment);
    this.translateService.get(comment.ack ? 'comment-page.a11y-rejected' : 'comment-page.a11y-banned').subscribe(status => {
      this.announceService.announce('comment-page.a11y-comment-has-been', { status: status });
    });
  }

  goToFullScreen(element: Element): void {
    document.body.requestFullscreen();
  }

  exitFullScreen(): void {
    document.exitFullscreen();
  }

  openPresentDialog(comment: Comment): void {
    this.goToFullScreen(document.documentElement);
    if (this.isCreator === true) {
      this.wsCommentService.highlight(comment);
      if (!comment.read) {
        this.setRead(comment);
      }
    }
    const dialogRef = this.dialogService.openCommentPresentationDialog(comment.body);
    dialogRef.afterClosed()
      .subscribe(result => {
        this.wsCommentService.lowlight(comment);
        this.exitFullScreen();

      });
  }
}
