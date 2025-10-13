import { Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { provideTranslocoScope } from '@jsverse/transloco';
import { CommentListFloatingButtonsComponent } from '@app/standalone/comment-list-floating-buttons/comment-list-floating-buttons.component';
import { CommentListAddButtonComponent } from '@app/standalone/comment-list-add-button/comment-list-add-button.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { CoreModule } from '@app/core/core.module';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentListBarComponent } from '@app/standalone/comment-list-bar/comment-list-bar.component';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-comments-page',
  templateUrl: './comments-page.component.html',
  styleUrls: ['../../common/styles/comments-page.scss'],
  imports: [
    CommentListBarComponent,
    LoadingIndicatorComponent,
    CommentSettingsHintComponent,
    CommentListHintComponent,
    CoreModule,
    CommentComponent,
    CommentListAddButtonComponent,
    CommentListFloatingButtonsComponent,
    DisabledIfReadonlyDirective,
  ],
  providers: [provideTranslocoScope('participant')],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit
{
  protected location = inject(Location);
  private focusModeService = inject(FocusModeService);

  focusModeEnabled = toSignal(this.focusModeService.getFocusModeEnabled());

  ngOnInit(): void {
    this.initializeScrollListener();
    // this.focusModeService
    //   .getFocusModeEnabled()
    //   .pipe(takeUntil(this.destroyed$))
    //   .subscribe((focusModeEnabled) => {
    //     this.focusModeEnabled = focusModeEnabled;
    //   });
    // this.focusModeService
    //   .getCommentState()
    //   .pipe(takeUntil(this.destroyed$))
    //   .subscribe((state) => this.highlightFocusedComment(state.commentId));
  }
}
