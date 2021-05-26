import {
  AfterContentInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientAuthentication } from '../../../models/client-authentication';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { AnnounceService } from '../../../services/util/announce.service';
import { CommentService } from '../../../services/http/comment.service';
import { Observable } from 'rxjs';
import { Comment } from '../../../models/comment';
import { CommentListComponent } from '../comment-list/comment-list.component';

@Component({
  selector: 'app-comment-page',
  templateUrl: './comment-page.component.html',
  styleUrls: ['./comment-page.component.scss']
})
export class CommentPageComponent implements OnInit, OnDestroy, AfterContentInit {

  @Input() isPresentation = false;

  @ViewChild(CommentListComponent) commentList: CommentListComponent;
  @ViewChild('commentList') commentListRef: ElementRef;

  auth: ClientAuthentication;
  comments$: Observable<Comment[]>;
  activeComment: Comment;

  constructor(
    private route: ActivatedRoute,
    private notification: NotificationService,
    private authenticationService: AuthenticationService,
    private eventService: EventService,
    private announceService: AnnounceService,
    private commentService: CommentService
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      if (document.getElementById('add-comment-button')) {
        document.getElementById('add-comment-button').focus();
      } else {
        document.getElementById('add-comment-small-button').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      document.getElementById('search-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('sort-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('filter-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('select-time-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      if (document.getElementById('start-button')) {
        document.getElementById('start-button').focus();
      } else {
        document.getElementById('pause-button').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit7) === true && focusOnInput === false) {
      if (document.getElementById('comment-entry')) {
        document.getElementById('comment-entry').focus();
      } else {
        document.getElementById('no-comments').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    } else if (document.getElementById('search-close-button') && KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true &&
      focusOnInput === true) {
      document.getElementById('search-close-button').click();
      document.getElementById('live-announcer-button').focus();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      const id = this.isPresentation ? 'presentation-button' : 'live-announcer-button';
      document.getElementById(id).focus();
    }, 800);
  }

  ngOnInit(): void {
    this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => this.auth = auth);
    this.route.data.subscribe(data => {
      this.comments$ = this.commentService.getAckComments(data.room.id);
    });
  }

  ngOnDestroy() {
    this.eventService.makeFocusOnInputFalse();
    if (this.activeComment) {
      this.commentService.lowlight(this.activeComment).subscribe();
    }
  }

  public announce() {
    const msg = this.isPresentation ? 'presentation.a11y-comment-shortcuts' : 'comment-page.a11y-shortcuts';
    this.announceService.announce(msg);
  }

  updateComment(comment: Comment) {
    if (this.activeComment) {
      this.commentService.lowlight(this.activeComment).subscribe();
    }
    this.activeComment = comment;
  }

  onScroll() {
    const nativeCommentList = this.commentListRef.nativeElement;
    const scrollTop = nativeCommentList.scrollTop;
    const scrollHeight = nativeCommentList.scrollHeight;
    this.commentList.checkScroll(scrollTop, scrollHeight);
  }

}
