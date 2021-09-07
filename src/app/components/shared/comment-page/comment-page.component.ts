import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientAuthentication } from '../../../models/client-authentication';
import { NotificationService } from '../../../services/util/notification.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { CommentService } from '../../../services/http/comment.service';
import { Comment } from '../../../models/comment';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { HotkeyService } from '../../../services/util/hotkey.service';

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
  activeComment: Comment;

  private hotkeyRefs: Symbol[] = [];

  constructor(
    private route: ActivatedRoute,
    private notification: NotificationService,
    private authenticationService: AuthenticationService,
    private commentService: CommentService,
    private hotkeyService: HotkeyService
  ) {
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
    this.hotkeyService.registerHotkey({
      key: 'Escape',
      action: () => {
        if (document.getElementById('search-close-button')) {
          document.getElementById('search-close-button').click();
          document.getElementById('live-announcer-button').focus();
        }
      },
      actionTitle: 'TODO'
    }, this.hotkeyRefs);
  }

  ngOnDestroy() {
    if (this.activeComment) {
      this.commentService.lowlight(this.activeComment).subscribe();
    }
    this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
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
