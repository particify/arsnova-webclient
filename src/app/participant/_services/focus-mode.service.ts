import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Message } from '@stomp/stompjs';
import { RoutingService } from '@app/core/services/util/routing.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';
import { EventService } from '@app/core/services/util/event.service';
import { BehaviorSubject, Subject, filter, map, takeUntil } from 'rxjs';
import { EntityChanged } from '@app/core/models/events/entity-changed';
import { EntityChangedPayload } from '@app/core/models/events/entity-changed-payload';
import { TranslateService } from '@ngx-translate/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

// Delay for event sending after switching between features
const DELAY_AFTER_NAVIGATION = 500;

@Injectable()
export class FocusModeService implements OnDestroy {
  destroyed$ = new Subject<void>();
  private focusModeEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(
    null
  );
  private contentStateUpdated$: EventEmitter<ContentFocusState> =
    new EventEmitter();
  private commentStateUpdated$: EventEmitter<CommentFocusState> =
    new EventEmitter();

  private currentRoom: Room;
  private currentFeature: RoutingFeature;

  constructor(
    private wsConnector: WsConnectorService,
    private http: HttpClient,
    private router: Router,
    private routingService: RoutingService,
    private eventService: EventService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private featureFlagService: FeatureFlagService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(null);
    this.destroyed$.complete();
  }

  init(room: Room, currentFeature: RoutingFeature) {
    if (!this.featureFlagService.isEnabled('FOCUS_MODE')) {
      return;
    }
    this.currentRoom = room;
    this.focusModeEnabled$.next(room.focusModeEnabled);
    this.currentFeature = currentFeature;
    this.getState();
    this.subscribeToState();
    this.subscribeToRoomChanges();
  }

  private subscribeToRoomChanges() {
    this.eventService
      .on('EntityChanged')
      .pipe(
        takeUntil(this.destroyed$),
        map((changes) => changes as EntityChangedPayload<Room>),
        filter((changes) => changes.entityType === 'Room')
      )
      .subscribe((changes) => {
        const changedEvent = new EntityChanged(
          'Room',
          changes.entity,
          changes.changedProperties
        );
        if (changedEvent.hasPropertyChanged('focusModeEnabled')) {
          const focusModeEnabled = changes.entity.focusModeEnabled;
          this.focusModeEnabled$.next(focusModeEnabled);
          if (focusModeEnabled) {
            this.evaluateNewState();
          } else {
            const msg = this.translateService.instant('focus-mode.stopped');
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.INFO
            );
          }
        }
      });
  }

  getContentState(): EventEmitter<ContentFocusState> {
    return this.contentStateUpdated$;
  }

  getCommentState(): EventEmitter<CommentFocusState> {
    return this.commentStateUpdated$;
  }

  getFocusModeEnabled() {
    return this.focusModeEnabled$;
  }

  private getState() {
    this.http
      .get<FocusEvent>(`api/room/${this.currentRoom.id}/focus-event`)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        this.evaluateNewState(state, true);
      });
  }

  private subscribeToState() {
    this.wsConnector
      .getWatcher(`/topic/${this.currentRoom.id}.focus.state.stream`)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg: Message) => {
        this.parseMsg(msg);
      });
  }

  private parseMsg(message: Message) {
    const state = JSON.parse(message.body);
    this.evaluateNewState(state);
  }

  private evaluateNewState(state?: FocusEvent, initial = false) {
    if (!state) {
      this.navigateToFeature();
      return;
    }
    let timeout = initial ? DELAY_AFTER_NAVIGATION : 0;
    const newFeature = RoutingFeature[state.feature];
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
    state: ContentFocusState | CommentFocusState | FeedbackFocusState,
    timeout: number
  ) {
    setTimeout(() => {
      if (feature === RoutingFeature.CONTENTS) {
        this.contentStateUpdated$.emit(state as ContentFocusState);
      } else if (feature === RoutingFeature.COMMENTS) {
        this.commentStateUpdated$.emit(state as CommentFocusState);
      }
    }, timeout);
  }

  private navigateToFeature(
    routingFeature?: RoutingFeature,
    series?: string,
    index?: number
  ) {
    const route = [
      this.routingService.getRoleRoute(UserRole.PARTICIPANT),
      this.routingService.getShortId(),
    ];
    if (routingFeature) {
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
