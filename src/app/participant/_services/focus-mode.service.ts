import { Injectable, inject } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RxStompState } from '@stomp/rx-stomp';
import { AbstractFocusModeService } from '@app/common/abstract/abstract-focus-mode.service';

// Delay for event sending after switching between features
const DELAY_AFTER_NAVIGATION = 500;

@Injectable()
export class FocusModeService extends AbstractFocusModeService {
  private router = inject(Router);
  private routingService = inject(RoutingService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  private contentStateUpdated$ = new Subject<ContentFocusState>();
  private commentStateUpdated$ = new Subject<CommentFocusState>();

  private currentFeature?: RoutingFeature;
  private wsConnectionState?: RxStompState;

  init(roomId: string, currentFeature: RoutingFeature) {
    if (!this.featureFlagService.isEnabled('FOCUS_MODE')) {
      return;
    }
    this.roomId = roomId;
    this.roomSettingsService.getByRoomId(roomId).subscribe((settings) => {
      this.focusModeEnabled = settings.focusModeEnabled;
      this.focusModeEnabled$.next(this.focusModeEnabled);
      if (this.focusModeEnabled) {
        this.loadState();
      }
      this.currentFeature = currentFeature;
      this.subscribeToState();
      this.subscribeToRoomChanges();
      this.subscribeToWsConnectionState();
      this.focusModeEnabled$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((focusModeEnabled) => {
          if (this.focusModeEnabled === focusModeEnabled) {
            return;
          }
          this.focusModeEnabled = focusModeEnabled;
          if (focusModeEnabled) {
            this.evaluateNewState();
          } else {
            const msg = this.translateService.translate(
              'participant.focus-mode.stopped'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.INFO
            );
          }
        });
    });
  }

  private subscribeToWsConnectionState() {
    this.wsConnector
      .getConnectionState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        switch (state) {
          case RxStompState.CLOSED:
            this.wsConnectionState = state;
            break;
          case RxStompState.OPEN:
            if (this.wsConnectionState === RxStompState.CLOSED) {
              // Reload current state from backend if ws has been reconnected
              this.loadState();
              this.wsConnectionState = state;
            }
            break;
        }
      });
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

  protected handleState(state?: FocusEvent, initial = false) {
    if (this.focusModeEnabled) {
      this.evaluateNewState(state, initial);
    }
  }

  private evaluateNewState(state?: FocusEvent, initial = false) {
    if (!state) {
      this.navigateToFeature(RoutingFeature.OVERVIEW);
      return;
    }
    let timeout = initial ? DELAY_AFTER_NAVIGATION : 0;
    const newFeature =
      RoutingFeature[state.feature as keyof typeof RoutingFeature];
    if (this.currentFeature !== newFeature) {
      timeout = DELAY_AFTER_NAVIGATION;
      if (newFeature === RoutingFeature.CONTENTS) {
        const contentState = state.focusState as ContentFocusState;
        this.navigateToFeature(
          newFeature,
          contentState.contentGroupName,
          contentState.contentIndex
        );
      } else {
        this.navigateToFeature(newFeature);
      }
      this.currentFeature = newFeature;
    }
    this.updateFeatureState(newFeature, state.focusState, timeout);
  }

  private updateFeatureState(
    feature: RoutingFeature,
    state:
      | ContentFocusState
      | CommentFocusState
      | FeedbackFocusState
      | undefined,
    timeout: number
  ) {
    setTimeout(() => {
      if (feature === RoutingFeature.CONTENTS) {
        this.contentStateUpdated$.next(state as ContentFocusState);
      } else if (feature === RoutingFeature.COMMENTS) {
        this.commentStateUpdated$.next(state as CommentFocusState);
      }
    }, timeout);
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
