import { Injectable, inject } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { HttpClient } from '@angular/common/http';
import { Room } from '@app/core/models/room';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractFocusModeService } from '@app/common/abstract/abstract-focus-mode.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { EventService } from '@app/core/services/util/event.service';

@Injectable()
export class FocusModeService extends AbstractFocusModeService {
  protected wsConnector: WsConnectorService;
  protected http: HttpClient;
  protected eventService: EventService;
  protected featureFlagService: FeatureFlagService;

  private state$ = new BehaviorSubject<FocusEvent | null>(null);

  constructor() {
    const wsConnector = inject(WsConnectorService);
    const http = inject(HttpClient);
    const eventService = inject(EventService);
    const featureFlagService = inject(FeatureFlagService);

    super(wsConnector, http, eventService, featureFlagService);

    this.wsConnector = wsConnector;
    this.http = http;
    this.eventService = eventService;
    this.featureFlagService = featureFlagService;
  }

  protected handleState(state: FocusEvent) {
    this.state$.next(state);
  }

  private getFeatureKey(feature: RoutingFeature): string {
    return Object.keys(RoutingFeature)[
      Object.values(RoutingFeature).indexOf(feature)
    ];
  }

  private sendState(room: string, newState: FocusEvent) {
    this.http.post(`api/room/${room}/focus-event`, newState).subscribe();
  }

  init(room: Room) {
    this.currentRoom = room;
    this.focusModeEnabled$.next(room.focusModeEnabled);
    if (room.focusModeEnabled) {
      this.loadState();
    }
    this.subscribeToState();
    this.subscribeToRoomChanges();
  }

  getState(): Observable<FocusEvent | null> {
    return this.state$;
  }

  updateContentState(
    room: Room,
    contentId: string,
    contentIndex: number,
    contentGroupId: string,
    contentGroupName: string
  ) {
    const state = new ContentFocusState(
      contentId,
      contentIndex,
      contentGroupId,
      contentGroupName
    );
    this.sendFeatureState(room, RoutingFeature.CONTENTS, state);
  }

  updateFeedbackState(room: Room, started: boolean) {
    this.sendFeatureState(
      room,
      RoutingFeature.FEEDBACK,
      new FeedbackFocusState(started)
    );
  }

  updateCommentState(room: Room, commentId: string) {
    this.sendFeatureState(
      room,
      RoutingFeature.COMMENTS,
      new CommentFocusState(commentId)
    );
  }

  updateOverviewState(room: Room) {
    this.sendFeatureState(room, RoutingFeature.OVERVIEW);
  }

  private sendFeatureState(
    room: Room,
    feature: RoutingFeature,
    state?: ContentFocusState | CommentFocusState | FeedbackFocusState
  ) {
    if (
      this.featureFlagService.isEnabled('FOCUS_MODE') &&
      room.focusModeEnabled
    ) {
      const newState = new FocusEvent(this.getFeatureKey(feature), state);
      this.sendState(room.id, newState);
    }
  }
}
