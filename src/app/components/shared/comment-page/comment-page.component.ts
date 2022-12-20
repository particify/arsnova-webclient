import {
  AfterContentInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientAuthentication } from '../../../models/client-authentication';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { CommentService } from '../../../services/http/comment.service';
import { Comment } from '../../../models/comment';
import { CommentListComponent } from '../comment-list/comment-list.component';

@Component({
  selector: 'app-comment-page',
  templateUrl: './comment-page.component.html',
  styleUrls: ['./comment-page.component.scss'],
})
export class CommentPageComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  isPresentation = false;

  @ViewChild(CommentListComponent) commentList: CommentListComponent;
  @ViewChild('commentList') commentListRef: ElementRef;

  auth: ClientAuthentication;
  activeComment: Comment;
  isModeration = false;

  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private commentService: CommentService
  ) {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      const id = this.isPresentation
        ? 'presentation-button'
        : 'live-announcer-button';
      document.getElementById(id).focus();
    }, 800);
  }

  ngOnInit(): void {
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.auth = auth));
    const routeData = this.route.snapshot.data;
    this.isPresentation = routeData.isPresentation;
    this.isModeration = routeData.isModeration;
  }

  ngOnDestroy() {
    if (this.activeComment) {
      this.commentService.lowlight(this.activeComment).subscribe();
    }
  }

  updateComment(comment: Comment) {
    if (comment) {
      if (this.activeComment?.highlighted) {
        this.commentService.lowlight(this.activeComment).subscribe();
      }
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
