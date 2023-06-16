import { Injectable } from '@angular/core';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { FeedbackFocusState } from '@app/core/models/events/remote/feedback-focus-state';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { HttpClient } from '@angular/common/http';
import { Room } from '@app/core/models/room';

@Injectable()
export class FocusModeService {
  constructor(private http: HttpClient) {}

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
    if (room.focusModeEnabled) {
      const newState = new FocusEvent(this.getFeatureKey(feature), state);
      this.sendState(room.id, newState);
    }
  }

  private getFeatureKey(feature: RoutingFeature): string {
    return Object.keys(RoutingFeature)[
      Object.values(RoutingFeature).indexOf(feature)
    ];
  }

  private sendState(room: string, newState: FocusEvent) {
    this.http.post(`api/room/${room}/focus-event`, newState).subscribe();
  }
}
