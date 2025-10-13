import { Location, AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  AbstractCommentsPageComponent,
  BAR_PADDING,
} from '@app/common/abstract/abstract-comments-page.component';
import { FormService } from '@app/core/services/util/form.service';
import { FlexModule } from '@angular/flex-layout';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { CommentListBarComponent } from '@app/standalone/comment-list-bar/comment-list-bar.component';
import { CommentListBarExtensionComponent } from './comment-list-bar-extension/comment-list-bar-extension.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { CommentListAddButtonComponent } from '@app/standalone/comment-list-add-button/comment-list-add-button.component';
import { CommentListFloatingButtonsComponent } from '@app/standalone/comment-list-floating-buttons/comment-list-floating-buttons.component';
import { CounterBracesPipe } from '@app/core/pipes/counter-braces.pipe';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  PauseQnaGql,
  QnaPostsByQnaIdDocument,
  StartQnaGql,
} from '@gql/generated/graphql';

const TAB_GROUP_HEIGHT = 48;

@Component({
  selector: 'app-comments-page',
  templateUrl: './comments-page.component.html',
  styleUrls: ['../../common/styles/comments-page.scss'],
  imports: [
    FlexModule,
    MatTabGroup,
    AutofocusDirective,
    MatTab,
    CommentListBarComponent,
    CommentListBarExtensionComponent,
    LoadingIndicatorComponent,
    CommentSettingsHintComponent,
    CommentListHintComponent,
    CommentComponent,
    CommentListAddButtonComponent,
    CommentListFloatingButtonsComponent,
    AsyncPipe,
    CounterBracesPipe,
    A11yIntroPipe,
    TranslocoPipe,
  ],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit
{
  protected location = inject(Location);
  protected routingService = inject(RoutingService);
  private formService = inject(FormService);
  private startQna = inject(StartQnaGql);
  private pauseQna = inject(PauseQnaGql);

  ngOnInit(): void {
    this.scrollStart += BAR_PADDING + TAB_GROUP_HEIGHT;
    this.initializeScrollListener();
  }

  pauseComments() {
    const id = this.qnaId();
    if (id) {
      this.pauseQna.mutate({ variables: { id } }).subscribe((r) => {
        if (r.data) {
          this.formService.enableForm();
          this.showReadonlyStateNotification();
        }
      });
    }
  }

  updateUrl(isModeration: boolean) {
    const role = this.routingService.getRoleRoute(this.viewRole());
    const url = [role, this.room().shortId, 'comments'];
    if (isModeration) {
      url.push('moderation');
    }
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  switchList(index: number) {
    this.isModeration.set(index === 1);
    this.updateUrl(index === 1);
  }

  enableComments() {
    const id = this.qnaId();
    if (id) {
      this.formService.disableForm();
      this.startQna
        .mutate({
          variables: { id },
        })
        .subscribe((r) => {
          if (r.data) {
            this.formService.enableForm();
            const msg = this.translateService.translate(
              'comment-list.qna-started'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        });
    }
  }

  clearPosts() {
    this.apollo.client.cache.writeQuery({
      query: QnaPostsByQnaIdDocument,
      variables: { query: this.queryVars() },
      data: {
        qnaPostsByQnaId: {
          edges: [],
        },
      },
    });
    this.postCountsRef?.refetch();
  }
}
