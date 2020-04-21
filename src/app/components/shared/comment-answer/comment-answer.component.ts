import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { Comment } from '../../../models/comment';
import { User } from '../../../models/user';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { UserRole } from '../../../models/user-roles.enum';
import { NotificationService } from '../../../services/util/notification.service';
import { DialogService } from '../../../services/util/dialog.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { EventService } from '../../../services/util/event.service';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-comment-answer',
  templateUrl: './comment-answer.component.html',
  styleUrls: ['./comment-answer.component.scss']
})
export class CommentAnswerComponent implements OnInit, AfterContentInit {

  comment: Comment;
  answer: string;
  isLoading = true;
  user: User;
  isStudent = true;
  edit = false;

  constructor(protected route: ActivatedRoute,
              private notificationService: NotificationService,
              private translateService: TranslateService,
              protected langService: LanguageService,
              protected wsCommentService: WsCommentServiceService,
              protected commentService: CommentService,
              private authenticationService: AuthenticationService,
              private dialogService: DialogService,
              private announceService: AnnounceService,
              private eventService: EventService) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      if (document.getElementById('answer-input')) {
        document.getElementById('answer-input').focus();
      } else {
        document.getElementById('answer-text').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.announce();
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      if (this.isStudent) {
        document.getElementById('answer-text').focus();
      } else {
        document.getElementById('message-button').focus();
      }
    }, 700);
  }

  ngOnInit() {
    this.user = this.authenticationService.getUser();
    if (this.user.role !== UserRole.PARTICIPANT) {
      this.isStudent = false;
    }
    this.route.data.subscribe(data => {
      this.comment = data.comment;
      this.answer = this.comment.answer;
      this.isLoading = false;
    });
  }

  public announce() {
    this.announceService.announce('comment-page.a11y-keys-answer');
  }

  editAnswer() {
    this.edit = true;
    setTimeout(() => {
      document.getElementById('answer-input').focus();
    }, 500);
  }

  saveAnswer() {
    this.edit = false;
    this.wsCommentService.answer(this.comment, this.answer);
    this.translateService.get('comment-page.comment-answered').subscribe(msg => {
      this.notificationService.show(msg);
    });
  }

  openDeleteAnswerDialog(): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-answer');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAnswer();
      }
    });
  }

  deleteAnswer() {
    this.answer = null;
    this.wsCommentService.answer(this.comment, this.answer);
    this.translateService.get('comment-page.answer-deleted').subscribe(msg => {
      this.notificationService.show(msg);
    });
  }
}
