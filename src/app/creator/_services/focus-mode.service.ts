import { Injectable } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractFocusModeService } from '@app/common/abstract/abstract-focus-mode.service';

@Injectable({
  providedIn: 'root',
})
export class FocusModeService extends AbstractFocusModeService {
  private state$ = new BehaviorSubject<FocusEvent | null>(null);

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

  init(roomId: string) {
    this.roomId = roomId;
    this.roomSettingsService.getByRoomId(roomId).subscribe((settings) => {
      this.focusModeEnabled$.next(settings.focusModeEnabled);
      if (settings.focusModeEnabled) {
        this.loadState();
      }
    });
    this.subscribeToState();
    this.subscribeToRoomChanges();
  }

  getState(): Observable<FocusEvent | null> {
    return this.state$;
  }

  updateContentState(
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
    this.sendFeatureState(RoutingFeature.CONTENTS, state);
  }

  updateFeedbackState(started: boolean) {
    this.sendFeatureState(
      RoutingFeature.FEEDBACK,
      new FeedbackFocusState(started)
    );
  }

  updateCommentState(commentId: string) {
    this.sendFeatureState(
      RoutingFeature.COMMENTS,
      new CommentFocusState(commentId)
    );
  }

  updateOverviewState() {
    this.sendFeatureState(RoutingFeature.OVERVIEW);
  }

  private sendFeatureState(
    feature: RoutingFeature,
    state?: ContentFocusState | CommentFocusState | FeedbackFocusState
  ) {
    if (
      this.featureFlagService.isEnabled('FOCUS_MODE') &&
      this.focusModeEnabled &&
      this.roomId
    ) {
      const newState = new FocusEvent(this.getFeatureKey(feature), state);
      this.sendState(this.roomId, newState);
    }
  }
}
