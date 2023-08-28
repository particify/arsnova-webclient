import { Injectable } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';
import { EventService } from '@app/core/services/util/event.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RxStompState } from '@stomp/rx-stomp';
import { AbstractFocusModeService } from '@app/common/abstract/abstract-focus-mode.service';

// Delay for event sending after switching between features
const DELAY_AFTER_NAVIGATION = 500;

@Injectable()
export class FocusModeService extends AbstractFocusModeService {
  private contentStateUpdated$ = new Subject<ContentFocusState>();
  private commentStateUpdated$ = new Subject<CommentFocusState>();
  private focusModeEnabled = false;

  private currentFeature: RoutingFeature;
  private wsConnectionState: RxStompState;

  constructor(
    protected wsConnector: WsConnectorService,
    protected http: HttpClient,
    protected featureFlagService: FeatureFlagService,
    protected eventService: EventService,
    private router: Router,
    private routingService: RoutingService,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {
    super(wsConnector, http, eventService, featureFlagService);
  }

  init(room: Room, currentFeature: RoutingFeature) {
    if (!this.featureFlagService.isEnabled('FOCUS_MODE')) {
      return;
    }
    this.currentRoom = room;
    this.focusModeEnabled = this.currentRoom.focusModeEnabled;
    this.focusModeEnabled$.next(this.focusModeEnabled);
    this.currentFeature = currentFeature;
    if (room.focusModeEnabled) {
      this.loadState();
    }
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
          const msg = this.translateService.instant('focus-mode.stopped');
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.INFO
          );
        }
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
    if (this.currentRoom.focusModeEnabled) {
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
