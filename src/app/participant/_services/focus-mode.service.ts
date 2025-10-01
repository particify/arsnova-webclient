import { Injectable, inject } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Observable, pairwise, startWith, Subject, takeUntil } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { AbstractFocusModeService } from '@app/common/abstract/abstract-focus-mode.service';

@Injectable()
export class FocusModeService extends AbstractFocusModeService {
  private router = inject(Router);
  private routingService = inject(RoutingService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  private contentStateUpdated$ = new Subject<ContentFocusState>();
  private commentStateUpdated$ = new Subject<CommentFocusState>();

  init() {
    if (!this.featureFlagService.isEnabled('FOCUS_MODE')) {
      return;
    }
    this.focusModeEnabled$
      .pipe(takeUntil(this.destroyed$), startWith(false), pairwise())
      .subscribe(([prev, cur]) => {
        if (!cur && prev) {
          const msg = this.translateService.translate(
            'participant.focus-mode.stopped'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.INFO
          );
        }
      });
    this.state$
      .pipe(startWith(undefined), pairwise())
      .subscribe((s) => this.handleStateTransition(s));
  }

  getContentState(): Observable<ContentFocusState> {
    return this.contentStateUpdated$;
  }

  getCommentState(): Observable<CommentFocusState> {
    return this.commentStateUpdated$;
  }

  getFocusModeEnabled() {
    return this.focusModeEnabled$;
  }

  private handleStateTransition(stateTransition: (FocusEvent | undefined)[]) {
    const [prev, cur] = stateTransition;
    if (this.routingService.getViewRole() !== UserRole.PARTICIPANT) {
      return;
    }
    if (!cur) {
      this.navigateToFeature(RoutingFeature.OVERVIEW);
      return;
    }
    const newFeature =
      RoutingFeature[cur.feature as keyof typeof RoutingFeature];
    if (cur !== prev) {
      if (newFeature === RoutingFeature.CONTENTS) {
        const contentState = cur.focusState as ContentFocusState;
        this.navigateToFeature(
          newFeature,
          contentState.contentGroupName,
          contentState.contentIndex
        );
      } else {
        this.navigateToFeature(newFeature);
      }
    }
    this.updateFeatureState(newFeature, cur.focusState);
  }

  private updateFeatureState(
    feature: RoutingFeature,
    state:
      | ContentFocusState
      | CommentFocusState
      | FeedbackFocusState
      | undefined
  ) {
    if (feature === RoutingFeature.CONTENTS) {
      this.contentStateUpdated$.next(state as ContentFocusState);
    } else if (feature === RoutingFeature.COMMENTS) {
      this.commentStateUpdated$.next(state as CommentFocusState);
    }
  }

  private navigateToFeature(
    routingFeature: RoutingFeature,
    series?: string,
    index?: number
  ) {
    const route = [
      this.routingService.getRoleRoute(UserRole.PARTICIPANT),
      this.routingService.getShortId(),
    ];
    if (routingFeature !== RoutingFeature.OVERVIEW) {
      route.push(routingFeature);
    }
    if (series) {
      route.push(series);
    }
    if (index !== undefined) {
      route.push((index + 1).toString());
    }
    this.router.navigate(route);
  }
}
